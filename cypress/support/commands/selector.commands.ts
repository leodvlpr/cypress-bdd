import { describeDefinition, describeStrategy } from '../selectors/selector';
import type { DriftEvent } from '../types/drift';
import type { AriaRole, SelectorDefinition, SelectorStrategy } from '../types/selector';

type ResolveOptions = Partial<Cypress.Loggable & Cypress.Timeoutable>;

const ROLE_CANDIDATES: Record<AriaRole, string> = {
  button: 'button, input[type="submit"], input[type="button"], input[type="reset"], [role="button"]',
  link: 'a[href], area[href], [role="link"]',
  heading: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
  img: 'img[alt], [role="img"]',
  radio: 'input[type="radio"], [role="radio"]',
};

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();

// Simplified accessible name for the roles above. CSS pseudo-content (icon-font glyphs) is ignored.
// Elements live in the app's iframe, so `instanceof` against this window's classes would always be false.
function accessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return normalize(ariaLabel);
  if (element.tagName === 'IMG') return normalize(element.getAttribute('alt') ?? '');
  if (element.tagName === 'INPUT') {
    const type = (element.getAttribute('type') ?? 'text').toLowerCase();
    if (['submit', 'button', 'reset'].includes(type)) return normalize(element.getAttribute('value') ?? '');
    const label = (element.id && element.ownerDocument.querySelector(`label[for="${element.id}"]`)) || element.closest('label');
    return normalize(label?.textContent ?? '');
  }
  return normalize(element.textContent ?? '');
}

function textMatches(element: HTMLElement, value: string | RegExp): boolean {
  const content = normalize(element.textContent ?? '');
  return typeof value === 'string' ? content.includes(normalize(value)) : value.test(content);
}

/** Synchronous, non-retrying lookup used to decide which strategy currently matches. */
function matchNow($root: JQuery<HTMLElement>, strategy: SelectorStrategy): JQuery<HTMLElement> {
  switch (strategy.type) {
    case 'data-qa':
      return $root.find(`[data-qa="${strategy.value}"]`);
    case 'id':
      return $root.find(`[id="${strategy.value}"]`);
    case 'css':
      return $root.find(strategy.value);
    case 'role':
      return $root
        .find(ROLE_CANDIDATES[strategy.value.role])
        .filter((_, element) => accessibleName(element) === strategy.value.name);
    case 'text': {
      const matching = $root
        .find(strategy.tag ?? '*')
        .not('script, style')
        .filter((_, element) => textMatches(element, strategy.value));
      // Like cy.contains: keep the deepest elements, not every ancestor containing the text.
      return strategy.tag ? matching : matching.filter((_, element) => !matching.toArray().some((other) => other !== element && element.contains(other)));
    }
  }
}

/** Retryable Cypress query for a strategy, so later assertions re-query the DOM. */
function query(strategy: SelectorStrategy, options: ResolveOptions): Cypress.Chainable<JQuery<HTMLElement>> {
  switch (strategy.type) {
    case 'data-qa':
      return cy.get(`[data-qa="${strategy.value}"]`, options);
    case 'id':
      return cy.get(`[id="${strategy.value}"]`, options);
    case 'css':
      return cy.get(strategy.value, options);
    case 'role':
      return cy
        .get(ROLE_CANDIDATES[strategy.value.role], options)
        .filter((_, element) => accessibleName(element) === strategy.value.name);
    case 'text':
      if (strategy.tag) return cy.contains(strategy.tag, strategy.value, options);
      // Cypress types the selector-less overload as yielding the previous subject; at runtime it yields the match.
      return cy.contains(strategy.value, options) as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
  }
}

/** Identifies the `.within()` scope an element was resolved in (e.g. `#product-2`); undefined at page level. */
function describeScope($root: JQuery<HTMLElement>): string | undefined {
  const root = $root[0];
  if (!root || root === root.ownerDocument.documentElement) return undefined;
  const qaValue = root.getAttribute('data-qa');
  if (qaValue) return `[data-qa="${qaValue}"]`;
  if (root.id) return `#${root.id}`;
  return root.tagName.toLowerCase();
}

function describeAll(definition: SelectorDefinition): string {
  return definition.strategies.map(describeStrategy).join(' → ');
}

// Single point of selector resolution. Each retry checks every strategy instantly, in order, so a
// broken strategy costs no waiting; the command only times out when no strategy matches at all.
// A match by any strategy other than the first is drift: the test continues and the event is logged.
Cypress.Commands.add('getElement', (definition: SelectorDefinition, options: ResolveOptions = {}) => {
  let matchedIndex = -1;
  let scope: string | undefined;

  return cy
    .root({ log: false, timeout: options.timeout })
    .should(($root) => {
      scope = describeScope($root);
      matchedIndex = definition.strategies.findIndex((strategy) => matchNow($root, strategy).length > 0);
      if (matchedIndex === -1) {
        throw new Error(`Element "${describeDefinition(definition)}" not found with any strategy: ${describeAll(definition)}`);
      }
    })
    .then(() => {
      const strategy = definition.strategies[matchedIndex];
      Cypress.log({ name: 'getElement', message: `${describeDefinition(definition)} (${describeStrategy(strategy)})` });

      if (matchedIndex > 0) {
        const event: DriftEvent = {
          name: definition.name,
          ...(definition.params && { params: { ...definition.params } }),
          label: describeDefinition(definition),
          ...(scope && { scope }),
          strategyUsed: describeStrategy(strategy),
          strategyIndex: matchedIndex,
          primaryStrategy: describeStrategy(definition.strategies[0]),
          timestamp: new Date().toISOString(),
          specPath: Cypress.spec.relative,
          test: Cypress.currentTest.titlePath.join(' > '),
          ...(definition.demo && { demo: true as const }),
        };
        const where = event.scope ? ` within ${event.scope}` : '';
        Cypress.log({ name: 'drift', message: `${event.label}${where}: ${event.primaryStrategy} missing, used ${event.strategyUsed}` });
        cy.task('logDrift', event, { log: false });
      }

      return query(strategy, options);
    });
});

// Absence must hold for every strategy, otherwise a drifted element would look "gone".
Cypress.Commands.add('expectAbsent', (definition: SelectorDefinition, options: ResolveOptions = {}) => {
  Cypress.log({ name: 'expectAbsent', message: describeDefinition(definition) });
  cy.root({ log: false, timeout: options.timeout }).should(($root) => {
    definition.strategies.forEach((strategy) => {
      expect(matchNow($root, strategy), `${describeDefinition(definition)} via ${describeStrategy(strategy)}`).to.have.length(0);
    });
  });
});

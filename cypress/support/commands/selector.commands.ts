import type { SelectorStrategy } from '../types/selector';

type ResolveOptions = Partial<Cypress.Loggable & Cypress.Timeoutable>;

function locate(strategy: SelectorStrategy, options: ResolveOptions): Cypress.Chainable<JQuery<HTMLElement>> {
  switch (strategy.by) {
    case 'qa':
      return cy.get(`[data-qa="${strategy.value}"]`, options);
    case 'css':
      return cy.get(strategy.value, options);
    case 'text':
      if (strategy.tag) return cy.contains(strategy.tag, strategy.value, options);
      // Cypress types the selector-less overload as yielding the previous subject; at runtime it yields the match.
      return cy.contains(strategy.value, options) as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
  }
}

// Single point of selector resolution: every element lookup in the suite goes through here.
// It currently resolves the preferred strategy only; the definitions already carry an ordered
// list so fallback + logging of the strategy used can be added here without touching components.
Cypress.Commands.add('getElement', (definition, options = {}) => {
  const [preferred] = definition.strategies;
  Cypress.log({ name: 'getElement', message: `${definition.name} (${preferred.by})` });
  return locate(preferred, options);
});

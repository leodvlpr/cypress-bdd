# Testing architecture

E2E framework built with Cypress + TypeScript + Cucumber (`@badeball/cypress-cucumber-preprocessor`) against
https://automationexercise.com. It is organised as **interaction components and business flows**, not Page
Objects.

## Layer flow

```text
feature (.feature)  →  step definition  →  flow  →  component  →  selector / custom command
```

| Layer | Location | Responsibility |
| --- | --- | --- |
| Feature | `cypress/e2e/features/` | Observable behaviour in Gherkin. No selectors or routes. |
| Step definition | `cypress/support/step_definitions/` | Translates Gherkin into flow/component calls. Thin, no selectors. |
| Flow | `cypress/support/flows/` | Composes components for a business intent (`signIn`). Knows nothing about Gherkin. Routes and `cy.visit` live in `navigation.flow.ts`. |
| Assertion | `cypress/support/assertions/` | Checks of a resulting state that no single component owns (signed out on the login page, drift event logged). Used by `Then` steps; looks up elements only through components and flows. |
| Component | `cypress/support/components/` | One reusable UI piece (header, signup form, cart table, payment form…), not a page. Objects of functions, not classes. |
| Selector | `cypress/support/selectors/` | One file per UI piece with named selector definitions (ordered strategies). No Cypress logic. |
| Command | `cypress/support/commands/` | `cy.getElement` (the single selector resolver) and API seeding. Typed in `support/types/cypress.d.ts`. |
| Data | `cypress/support/data/`, `cypress/fixtures/` | Factories for unique per-scenario data and the reference product catalog. |
| Context | `cypress/support/world.ts`, `step_definitions/hooks.ts` | Per-scenario state (`this`) and cleanup after every scenario. |

## Current coverage

| Feature | Scenarios | Components / flows |
| --- | --- | --- |
| `home.feature` | Homepage loads with the store logo (`@smoke`) | `header` / `navigation.flow` |
| `authentication.feature` | Valid login (`@smoke`), incorrect password, logout | `auth`, `header` / `authentication.flow` |
| `registration.feature` | UI sign-up (`@smoke`), email already registered | `signup-form`, `account-details-form`, `account-created`, `header` / `registration.flow` |
| `catalog.feature` | Search (`@smoke`), product detail | `product-search`, `product-detail` / `catalog.flow` |
| `cart.feature` | Add several products with quantities (`@smoke`, typed DataTable), remove product | `product-detail`, `cart-added-modal`, `cart-table` / `cart.flow` |
| `checkout.feature` | Signed-in order: delivery address + payment (`@smoke`) | `cart-table`, `order-review`, `payment-form`, `order-confirmation` / `checkout.flow` |
| `contact.feature` | Contact form submission | `contact` / `contact.flow` |
| `resilience-demo.feature` | **`@demo`, excluded by default.** Degraded selector falls back and logs demo drift | `resilience-demo` / `resilience-demo.flow` |

Out of scope for now: subscription, categories/brands, reviews, invoice and scrolling.

> Step definitions live in `cypress/support/step_definitions/` because `.cypress-cucumber-preprocessorrc.json`
> defines that location since the initial setup.

## Language

Everything in the project is written in English: feature names and descriptions, Given/When/Then steps,
step definition expressions, test data, code, comments and documentation.

## Scenario naming convention

Every `Scenario` is titled `<ID> [COMPONENT] Validate <main assertion>`:

```gherkin
Scenario: 003 [LOGIN] Validate incorrect password shows the invalid credentials error
```

- **ID**: 3-digit number, unique across the suite and increasing. A new scenario takes the next free ID; IDs
  are never reused, even when a scenario is deleted.
- **Component**: functional area in upper case between brackets: `HOME`, `LOGIN`, `LOGOUT`, `SIGNUP`, `SEARCH`,
  `PRODUCT`, `CART`, `CHECKOUT`, `CONTACT`, `RESILIENCE`. For a new area, add it to `COMPONENTS` in
  `scripts/check-scenario-names.mjs`.
- **Title**: starts with `Validate` and describes the scenario's main assertion.

`npm run lint:scenarios` checks the format, duplicate IDs and components, and prints the next free ID.

## Selector convention

### Single point of resolution

Every element lookup goes through **`cy.getElement(definition)`** (`support/commands/selector.commands.ts`), and
absence checks through **`cy.expectAbsent(definition)`**. Components never call `cy.get`, `cy.contains` or
`.find` directly, and only `navigation.flow.ts` calls `cy.visit` or `cy.location`. `npm run lint:selectors`
enforces this.

A selector definition has a stable logical name and an ordered list of strategies:

```ts
export const orderReviewSelectors = {
  placeOrderButton: selector(
    'orderReview.placeOrderButton',
    role('link', 'Place Order'), // primary
    css('a[href="/payment"]'),   // fallback 1
    text('Place Order', 'a'),    // fallback 2
  ),
};
```

| Strategy | Builder | Use |
| --- | --- | --- |
| `data-qa` | `qa('login-email')` | `data-qa` attribute: the agreed contract with development. Always primary when it exists. |
| `id` | `id('search_product')` | App-owned element id. |
| `css` | `css('a[href="/payment"]')` | Other app-owned attribute (`data-*`, form field `name`, `href`). Never style classes. |
| `role` | `role('button', 'Add to cart')` | ARIA role + accessible name, for elements with a real role (button, link, heading, img, radio). |
| `text` | `text('Proceed To Checkout', 'a')` | Visible text, only when that text is the contract under test. |

Notes on `role`:

- The accessible name is computed from `aria-label`, `alt` (images), `value` (input buttons), the associated
  `<label>` (radios) or the text content. Icon-font glyphs (CSS `::before`) are ignored.
- Elements without a real role keep `text` as their only strategy, e.g. `<a>` without `href` such as
  "Proceed To Checkout" or "Logged in as …".

### Resolution and drift

1. `getElement` checks **every strategy instantly and in order** on each retry, so a broken strategy costs no
   waiting.
2. **First strategy matches:** the test continues normally.
3. **A later strategy matches:** the test continues, the command log shows a `drift` entry, and
   `cy.task('logDrift')` appends one line to `cypress/.drift/drift-log.ndjson`:

   ```json
   {"name":"cartTable.quantity","params":{"quantity":1},"label":"cartTable.quantity(quantity=1)","scope":"#product-2",
    "strategyUsed":"text(/^\\s*1\\s*$/, button)","strategyIndex":1,"primaryStrategy":"role(button, \"1\")",
    "timestamp":"…","specPath":"cypress/e2e/features/cart.feature","test":"Shopping cart > 009 [CART] Validate …"}
   ```

   | Field | Meaning |
   | --- | --- |
   | `name` | Logical selector name, stable for grouping (`cartTable.quantity`). |
   | `params` | Arguments of a parameterized definition (`{ "quantity": 1 }`); absent for plain ones. |
   | `label` | Readable id of the exact instance (`cartTable.quantity(quantity=1)`). |
   | `scope` | The `.within()` element it was resolved in (`#product-2`); absent at page level. Tells apart instances with identical params, e.g. two cart rows with the same quantity. |
   | `strategyUsed` / `strategyIndex` / `primaryStrategy` | What matched, its position, and the primary that did not. |
   | `timestamp` / `specPath` / `test` | When and where it happened. |

4. **No strategy matches** within the command timeout: the test fails with
   `Element "<name>" not found with any strategy: <all strategies>`. A total failure is never swallowed.
5. `expectAbsent` passes only when **no** strategy matches, so an element reachable through a fallback is
   never reported as gone.

The log is emptied at the start of every `cypress run` (`resetDriftLog`, also available as a task), so it only
reflects the latest run. An **empty** file means a clean run: no drift. The `cypress/.drift/` folder is git-ignored.

### Parameterized definitions

Factories build their definitions with `paramSelector`, which records the arguments in `params`:

```ts
row: (productId: number) => paramSelector('cartTable.row', { productId }, id(`product-${productId}`)),
```

`npm run lint:selectors` rejects a factory built with plain `selector()`, because its arguments would be missing
from drift logs.

### Resilience demo (`@demo`)

`resilience-demo.feature` (`013 [RESILIENCE]`) exists **only to demonstrate the fallback + drift mechanism**.

- **Deliberately degraded selector:** `resilienceDemo.degradedLogo` has a primary `data-qa` that does not exist
  on the site, so resolution always falls back to the logo's verified `role(img, …)` strategy.
- **Self-checking:** the scenario asserts both that the logo is still found and that the drift event was
  written, with the expected strategy index, primary and fallback.
- **Isolated output:** the definition is wrapped in `demoSelector()`, which sets `demo: true`. The `logDrift`
  task routes those events to `cypress/.drift/demo-drift-log.ndjson`, never to `drift-log.ndjson`, so the
  deliberate degradation never pollutes the real drift signal.
- **Excluded by default:** `cypress.config.ts` sets `env.tags = 'not @demo'`, and the preprocessor's
  `filterSpecs` / `omitFiltered` skip the spec entirely. `npm run cy:run` never runs it.
- **Running it:** `npm run cy:demo` (`--env tags=@demo`) runs only `@demo` scenarios.
- **Reset per log:** each run empties only the log it writes to. `cy:run` resets `drift-log.ndjson` and
  leaves the demo log untouched; `cy:demo` resets `demo-drift-log.ndjson` and leaves the real log untouched.
- **Scope:** `demoSelector()` must only be used by `@demo` scenarios.

### Adding a fallback

Only add a fallback after confirming on the real site (Playwright) that it identifies **the same DOM node** as
the primary strategy, and record the result in [`selector-verification.md`](selector-verification.md). Every
fallback in the suite was checked this way. Elements with no second stable hook
keep a single strategy (e.g. `#cartModal`, `#submit_search`, the cart remove link).

### Rules

- The app already uses **`data-qa`** (`login-email`, `login-password`, `login-button`, …), so it is the preferred
  strategy. Neither `data-testid` nor `data-cy` is introduced.
- Forbidden: XPath, style classes, DOM structure, indexes (`:nth-child`) or text as the primary selector.
- **Narrow exception, fallbacks only:** a fallback may be scoped by an app-owned attribute of an ancestor when the
  element's own attributes are ambiguous, e.g. `[data-qa="title"] input[value="Mr"]` (data-qa on the radio group)
  or `form[action="/login"] input[name="email"]` (two forms share `name="email"`). Never as the primary
  strategy.
  Visible text is only used when it **is** the contract under test (e.g. `Logged in as <name>`).
- Business data (product name, price, address) is asserted inside a resolved element, e.g. a cart row with
  `.within()`, so the check is scoped to the right UI piece.
- When an element has no `data-qa`, the request to development is documented instead of inventing a fragile
  selector.

### `data-qa` attributes requested from development

| Element | Proposed attribute | Current hook |
| --- | --- | --- |
| Header session indicator ("Logged in as …") | `data-qa="logged-in-user"` | Visible text (business contract) |
| Header Logout link | `data-qa="logout-link"` | Accessible name "Logout" |
| Login / sign-up error messages | `data-qa="login-error"`, `data-qa="signup-error"` | Visible message text |
| Product search | `data-qa="search-input"`, `data-qa="search-button"` | `#search_product`, `#submit_search` |
| Quantity and "Add to cart" button on product detail | `data-qa="quantity"`, `data-qa="add-to-cart"` | `#quantity`, accessible name |
| "Added!" modal | `data-qa="cart-added-modal"` | `#cartModal` |
| Cart rows, quantity and remove | `data-qa="cart-row"`, `data-qa="cart-quantity"`, `data-qa="cart-remove"` | `#product-<id>`, `[data-product-id]`, button text |
| "Proceed To Checkout" / "Place Order" | `data-qa="proceed-to-checkout"`, `data-qa="place-order"` | Accessible name |
| Delivery address and order comment | `data-qa="delivery-address"`, `data-qa="order-comment"` | `#address_delivery`, `textarea[name="message"]` |
| Contact success message | `data-qa="contact-success"` | Visible message text |

## When to create each piece

- **Component**: one reusable UI piece (login form, header, "Added!" modal, cart table, payment form), named
  after the piece, not the page. A screen with several pieces gets several components; a piece shown on several
  screens gets one. It runs a minimal availability check (`should('be.visible')`) before interacting, never
  calls `cy.visit`, and never navigates, authenticates and verifies all at once.
- **Flow**: when a business intent needs several components (`openLogin`, `signIn`). No scenario-specific
  assertions; it waits for observable conditions (network aliases) that are part of its contract.
- **Assertion helper** (`support/assertions/`): when a `Then` checks a resulting state that spans components
  or lives outside the UI (current path + header, drift log). It never interacts with the page.
- **Selector definition**: one per element the suite touches, in the selectors file of its UI piece, named
  `<piece>.<element>`.
- **Custom command**: only for universal, repeated primitives (`getElement`) or API seeding/cleanup
  (`createAccountByApi`, `deleteAccountByApi`). Flows are not turned into `cy.*` commands and no command accepts
  arbitrary selectors. Every command has JSDoc and a declaration in `cypress.d.ts`.
- **Step definition**: domain vocabulary (`When the user logs in`), never generic (`When I click "X"`).

## Test data

- Each scenario creates its own user with `buildUniqueUser()` (unique email + random password) through
  `cy.createAccountByApi()` against the public `POST /api/createAccount` endpoint.
- The `After` hook deletes it with `cy.deleteAccountByApi()` (`DELETE /api/deleteAccount`), so runs are
  idempotent and parallel-safe.
- Scenario state is shared through the preprocessor context (`this`) and cleared after every scenario.
- There are no real credentials in the repository. Passwords are never written to the Cypress log
  (`log: false`, `failOnStatusCode: false`).
- The reference catalog (`cypress/fixtures/products.json`) mirrors stable products of the demo store (checked
  against `GET /api/productsList`). Features refer to products by name and `findProduct()` fails listing the
  known products when the name does not exist.
- Gherkin tables are converted to types (`parseCartTable`) and an invalid row fails naming the row and column.
- Payment uses the public test card 4111 1111 1111 1111; the store does not process real payments.
- `cy.loginByApi` / `cy.setAuthSession` are **not** implemented: `POST /api/verifyLogin` only validates
  credentials and issues no session cookie, so login goes through the UI.

## Network and third parties

- Every flow declares `cy.intercept()` before the action and waits for the alias, never a fixed duration:
  `POST /login`, `GET /logout`, `POST /signup`, `GET /products?search=`, `GET /add_to_cart/<id>`,
  `GET /delete_cart/<id>`, `GET /checkout`, `POST /payment`.
- The contact form **sends nothing to the server**: the page's JS shows a `confirm` and renders the success
  message client-side. The flow waits for that `confirm` (`window:confirm` stub) as the observable condition.
  The scenario validates the user experience, not that the backend receives the message.
- `cypress.config.ts` uses `blockHosts` to block the consent dialog (Google Funding Choices) and ads: they
  overlay the page non-deterministically and are not part of the system under test.

## Running locally

```bash
npm install
npm run typecheck
npm run lint                                                         # scenario names + selector usage
npm run lint:scenarios                                               # scenario names + next free ID
npx cypress run --spec cypress/e2e/features/authentication.feature   # reference feature
npx cypress run --spec "cypress/e2e/features/cart.feature"           # any single feature
npm run cy:run                                                       # whole suite (excludes @demo)
npm run cy:demo                                                      # only @demo scenarios (resilience demo)
cat cypress/.drift/drift-log.ndjson                                  # real drift from the last cy:run (empty = none)
npm run drift:report                                                 # drift summary table (cypress/.drift/summary.md)
cat cypress/.drift/demo-drift-log.ndjson                             # demo drift from the last cy:demo
npm run cy:open                                                      # interactive mode
```

Requires internet access to https://automationexercise.com.

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`, on `ubuntu-latest` with Node 22:

1. `npm ci`
2. `npm run lint:scenarios`: scenario names and IDs.
3. `npm run lint:selectors`: every lookup goes through `cy.getElement`.
4. `npm run typecheck`
5. `npm run cy:run`: the main suite. `@demo` scenarios are excluded by `env.tags = 'not @demo'`.

Artifacts:

| Artifact | When | Retention | Content |
| --- | --- | --- | --- |
| `cypress-artifacts` | On failure | 7 days | `cypress/screenshots`, `cypress/videos` |
| `drift-log` | Always | 30 days | `cypress/.drift/drift-log.ndjson`; empty when no selector drifted |

The resilience demo (`npm run cy:demo`) is not part of CI.

### Weekly report

`.github/workflows/weekly-report.yml` runs the main suite **every Monday at 08:00 UTC**, and on demand with
`gh workflow run weekly-report.yml`. It emails a report to `GMAIL_USERNAME` (repository secrets `GMAIL_USERNAME`
and `GMAIL_APP_PASSWORD`, a Gmail app password).

1. `npm run cy:run`, tee'd to `cypress-output.log`. It has `continue-on-error`, so the email is always sent, and
   `shell: bash` (pipefail), so a failure is not masked by `tee`.
2. `npm run drift:report`: `scripts/drift-report.mjs` turns `drift-log.ndjson` into `cypress/.drift/summary.md`,
   with one row per selector instance and scope.
3. `scripts/weekly-report.mjs` builds `weekly-report.md` from the Cypress output (ANSI stripped): verdict,
   totals, failed scenarios by title, the per-spec "Run Finished" table and the drift summary.
4. The report is emailed (plain text plus Markdown rendered as HTML). The subject ends in `(passed)` or
   `(FAILED)`.
5. The report, the raw output, the drift files and any screenshots are uploaded as the `weekly-report`
   artifact (30 days).
6. The job is marked red when the suite failed, so both signals exist: the email, and the Actions status.

`npm run drift:report` also works locally after any `cy:run`.

### Automated PR review (Claude Code)

`.github/workflows/pr-review.yml` uses `anthropics/claude-code-action@v1` (repository secrets `ANTHROPIC_API_KEY` and
`ANTHROPIC_BASE_URL`; the base URL is passed as step `env`, which the action forwards to Claude Code).
It has two moments:

| Job | Trigger | What it does |
| --- | --- | --- |
| `review` | PR against `main` opened, updated or reopened | Reviews the PR diff against **this document**. It posts inline comments on specific violations and one summary comment with a verdict (✅ / ⚠️ / ❌). A new push cancels a review still in progress for the same PR. |
| `merge-wrap-up` | PR merged into `main` | Posts a short comment confirming whether the merge introduced convention drift. |

The review prompt checks the conventions documented here:

- components per UI piece, not pages;
- every lookup through `cy.getElement` / `cy.expectAbsent`;
- selector definitions with ordered strategies and `paramSelector` for factories;
- thin step definitions;
- scenario naming;
- determinism rules;
- the resilience policy;
- English only.

**Keep this document current:** the reviewer is only as accurate as this document. Change the conventions here
first, then in the code.

The comments are posted by `github-actions[bot]` through the workflow's `GITHUB_TOKEN` (`github_token` input), so
the Claude GitHub App is not required.

## Self-healing policy

- **Agreed scope:** fallback selectors **with logging** of which strategy was used, implemented in
  `cy.getElement` and recorded in `cypress/.drift/drift-log.ndjson`.
- **Rejected:** silent auto-repair, meaning code or selectors that rewrite themselves without human review.
- **Handling drift:** a drift event means the primary strategy no longer matches. Someone reviews it and updates
  the selector definition (or requests the missing `data-qa`) in a PR that goes through CI. Nothing is accepted
  automatically on `main`.
- Track flakiness rate, drift events and false positives over time.

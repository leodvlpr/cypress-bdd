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
| Flow | `cypress/support/flows/` | Composes components for a business intent (`signIn`). Knows nothing about Gherkin. |
| Component | `cypress/support/components/` | One small, stable interaction on a piece of UI (`authComponent.fillCredentials`). Objects of functions, not classes. |
| Selector | `cypress/support/selectors/` | `data-qa` values grouped by domain. No Cypress logic. |
| Command | `cypress/support/commands/` | Universal primitives (`cy.getByQa`) and API seeding. Typed in `support/types/cypress.d.ts`. |
| Data | `cypress/support/data/`, `cypress/fixtures/` | Factories for unique per-scenario data and the reference product catalog. |
| Context | `cypress/support/world.ts`, `step_definitions/hooks.ts` | Per-scenario state (`this`) and cleanup after every scenario. |

## Current coverage

| Feature | Scenarios | Components / flows |
| --- | --- | --- |
| `authentication.feature` | Valid login (`@smoke`), incorrect password, logout | `auth`, `navigation` / `authentication.flow` |
| `registration.feature` | UI sign-up (`@smoke`), email already registered | `registration`, `navigation` / `registration.flow` |
| `catalog.feature` | Search (`@smoke`), product detail | `catalog` / `catalog.flow` |
| `cart.feature` | Add several products with quantities (`@smoke`, typed DataTable), remove product | `catalog`, `cart` / `cart.flow` |
| `checkout.feature` | Signed-in order: delivery address + payment (`@smoke`) | `cart`, `checkout` / `checkout.flow` |
| `contact.feature` | Contact form submission | `contact` / `contact.flow` |
| `smoke.feature` | Homepage loads (setup wiring) | — |

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
  `PRODUCT`, `CART`, `CHECKOUT`, `CONTACT`. For a new area, add it to `COMPONENTS` in
  `scripts/check-scenario-names.mjs`.
- **Title**: starts with `Validate` and describes the scenario's main assertion.

`npm run lint:scenarios` checks the format, duplicate IDs and components, and prints the next free ID.

## Selector convention

- The app already uses **`data-qa`** (`login-email`, `login-password`, `login-button`, …), so it is the only
  convention in the framework: `cy.getByQa('login-email')`. Neither `data-testid` nor `data-cy` is introduced.
- Selectors are stored as the attribute **value**, grouped by domain and with a semantic name:

  ```ts
  export const authSelectors = { loginEmailInput: 'login-email' } as const;
  ```

- **Order of preference** when an element has no `data-qa`:
  1. An app-owned `id` or `data-*` attribute (`#search_product`, `#product-1`, `[data-product-id="1"]`), stored
     as a full CSS selector in the selectors file and used with `cy.get`. Each one is marked with a comment and
     listed below as a `data-qa` request.
  2. The control's accessible name (`cy.contains('button', 'Add to cart')`) when there is no stable attribute.
- Forbidden: XPath, style classes, DOM structure, indexes (`:nth-child`) or text as the primary selector.
  Visible text is only used when it **is** the contract under test (e.g. `Logged in as <name>`).
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

- **Component**: a reusable interaction on a specific area of the UI (login form, header, modal, toast). It runs
  a minimal availability check (`should('be.visible')`) before interacting. It never navigates, authenticates
  and verifies all at once.
- **Flow**: when a business intent needs several components (`openLogin`, `signIn`). No scenario-specific
  assertions; it waits for observable conditions (network aliases) that are part of its contract.
- **Custom command**: only for universal, repeated primitives (`getByQa`) or API seeding/cleanup
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
npm run lint:scenarios                                               # scenario names + next free ID
npx cypress run --spec cypress/e2e/features/authentication.feature   # reference feature
npx cypress run --spec "cypress/e2e/features/cart.feature"           # any single feature
npm run cy:run                                                       # whole suite
npm run cy:open                                                      # interactive mode
```

Requires internet access to https://automationexercise.com.

## Future self-healing policy (not implemented)

1. Detect the broken selector and collect evidence (DOM, screenshot, request/response, run history).
2. Propose a fix based on test attributes, subject to human review.
3. Validate in CI and open a PR; never change selectors or accept results automatically on `main`.
4. Measure flakiness rate, repaired failures and false positives.

A mechanism that "finds something similar" can hide a real regression and undermine trust in the suite, so no
selector fallbacks or silent self-repair are added.

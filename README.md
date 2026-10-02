# automationexercise-cypress-bdd

**A Cypress + TypeScript + Cucumber BDD framework built around reusable UI components, with resilient selectors
that log drift instead of hiding it, and Claude Code reviewing every pull request against the repo's own
conventions.**

> This targets **[automationexercise.com](https://automationexercise.com)**, a public demo store built for
> practising test automation. It is a portfolio project, not a client or employer codebase.

[![Cypress BDD Suite](https://github.com/leodvlpr/cypress-bdd/actions/workflows/ci.yml/badge.svg)](https://github.com/leodvlpr/cypress-bdd/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-14.5-69D3A7?logo=cypress&logoColor=white)
![Cucumber BDD](https://img.shields.io/badge/BDD-Cucumber%20%2F%20Gherkin-23D96C?logo=cucumber&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

| | |
| --- | --- |
| **Scenarios** | 12 in the main suite (7 feature files), plus 1 dedicated resilience demo |
| **Main suite run** | 12/12 passing: 45 s locally, 34 s in CI (Cypress 14.5.4, Electron headless) |
| **UI components** | 13 reusable pieces (plus 1 used only by the demo), no Page Objects |
| **Selector definitions** | 70, of which 48 have verified fallback strategies |

---

## Why component-based, not Page Object Model

A Page Object mirrors a screen: `LoginPage`, `CheckoutPage`, one class per URL, with every element on it. That
fits poorly with BDD, where scenarios are written as **user journeys that cross screens**, and where the same UI
piece (a header, a cart modal) shows up on many pages.

Here, each component is **one reusable UI piece**, not a page:
- `header`
- `signup-form`
- `account-details-form`
- `product-search`
- `cart-added-modal`
- `cart-table`
- `payment-form`
- …

A screen with three pieces gets three components. A piece that appears on several screens gets one. Step
definitions stay thin and compose those pieces in the order the journey needs them.

Here is a real step definition (`cypress/support/step_definitions/registration.steps.ts`) where one `Then`
composes two different components: the account confirmation, then the header.

```ts
Then('the account is created and the user is logged in', function (this: ScenarioWorld) {
  accountCreatedComponent.expectVisible();
  // The session indicator is only rendered once the user leaves the confirmation page.
  accountCreatedComponent.continue();
  headerComponent.expectLoggedInAs(requireRegisteredUser(this).name);
});
```

`headerComponent` is the same object the login, logout and smoke scenarios use. There is no `RegistrationPage`
that would need its own copy of the header.

The layers:

```text
feature  →  step definition  →  flow  →  component  →  selector definition  →  cy.getElement (resolver)
                                   ↘ assertion helper (cross-component end states)
```

| Layer | Responsibility |
| --- | --- |
| **Feature** | Observable behaviour in Gherkin. No selectors or routes. |
| **Step definition** | Translates Gherkin into flow/component calls. |
| **Flow** | Composes components for a business intent (`signIn`, `addToCart`, `payOrder`). Waits on network aliases, never fixed sleeps. |
| **Component** | One UI piece. Plain objects of functions, not classes. |
| **Selector definition** | A named, ordered list of strategies per element. |
| **Resolver** (`cy.getElement`) | The single place where the DOM is queried. |

Two custom lint scripts keep this honest in CI:
- `lint:selectors` fails the build if any file outside the resolver calls `cy.get`, `cy.contains` or `.find`, or
  if `cy.visit` is used outside the navigation flow.
- `lint:scenarios` enforces the scenario-naming convention.

## BDD with Cucumber

Scenarios are written in Gherkin with domain language, and run through
[`@badeball/cypress-cucumber-preprocessor`](https://github.com/badeball/cypress-cucumber-preprocessor) with
esbuild. Example: [`cypress/e2e/features/cart.feature`](cypress/e2e/features/cart.feature).

```gherkin
Scenario: 009 [CART] Validate cart lists each added product with its quantity and total price
  When the customer adds to the cart:
    | product    | quantity |
    | Blue Top   | 3        |
    | Men Tshirt | 1        |
  Then the cart contains:
    | product    | quantity |
    | Blue Top   | 3        |
    | Men Tshirt | 1        |
```

**Gherkin practices:**
- **Typed data tables:** they are parsed into typed objects, and a bad row fails with the row and column.
- **Fresh data per scenario:** each scenario creates its own unique user through the store's public API, and
  deletes it afterwards. There are no shared accounts and no credentials in the repo.

**Naming convention:** every scenario is titled `<ID> [COMPONENT] Validate <main assertion>`, e.g.
`003 [LOGIN] Validate incorrect password shows the invalid credentials error`.
- IDs are unique, increasing and never reused.
- `npm run lint:scenarios` checks the format and duplicate IDs, and prints the next free ID.

## Resilient selectors & drift logging

This is the most interesting part of the framework, so here is exactly what it does and does not do.

### The mechanism: ordered fallback strategies

Every element the suite touches has a **selector definition**: a stable logical name plus an ordered list of
strategies.

```ts
placeOrderButton: selector(
  'orderReview.placeOrderButton',
  role('link', 'Place Order'), // primary
  css('a[href="/payment"]'),   // fallback 1
  text('Place Order', 'a'),    // fallback 2
),
```

**Strategy types.** `data-qa` is always primary when the element has one. The others are chosen per element, by
what the site actually offers:

- `data-qa`: the site's own test attribute.
- `id`: an app-owned element id.
- `css`: other app-owned attributes (`data-*`, `name`, `href`), never style classes.
- `role`: ARIA role + accessible name.
- `text`: only when the text *is* the contract under test, e.g. error messages, product data, or links rendered
  without an `href` (and so without a link role).

**How `cy.getElement(definition)` resolves an element:**
- On each retry it checks **every strategy instantly, in order**, so a broken strategy costs no waiting.
- **First strategy matches:** nothing special happens.
- **A later strategy matches:** the test continues, and a **drift event** is written to
  `cypress/.drift/drift-log.ndjson`.
- **No strategy matches:** the test fails normally, with the list of every strategy it tried. A total failure is
  never swallowed.

**Fallback evidence:** every fallback was checked against the live site with Playwright, and had to resolve to
**the same DOM node** as its primary. The evidence is in
[`docs/selector-verification.md`](docs/selector-verification.md).

### What gets logged, and why

```json
{"name":"cartTable.quantity","params":{"quantity":1},"label":"cartTable.quantity(quantity=1)","scope":"#product-2",
 "strategyUsed":"text(/^\\s*1\\s*$/, button)","strategyIndex":1,"primaryStrategy":"role(button, \"1\")",
 "timestamp":"…","specPath":"cypress/e2e/features/cart.feature","test":"Shopping cart > 009 [CART] Validate …"}
```

| Field | Why it is there |
| --- | --- |
| `name` | Stable logical id, so events can be grouped over time. |
| `params` | Arguments of a parameterized definition (`cartTable.row(productId)`). Without them, two rows that drift are indistinguishable. |
| `label` | Human-readable instance id for reports. |
| `scope` | The `.within()` element it was resolved in. It separates instances whose params are identical, e.g. two cart rows with the same quantity. |
| `primaryStrategy` / `strategyUsed` / `strategyIndex` | What broke and what saved the test. |

`npm run drift:report` turns the log into a Markdown table. The weekly report includes it (see below).

### Scope honesty: this is not AI self-healing

There is **no AI in the resolver** and **nothing rewrites code**. It is deterministic fallback with transparent
logging:

- **The test still passes,** so a cosmetic change on the site doesn't page anyone at 3 a.m.
- **The drift is recorded,** with enough context to find the exact element.
- **A human fixes the selector definition in a PR**, assisted by the Claude Code review, which checks selector
  changes against the documented rules. Nothing is applied automatically.

A mechanism that silently "finds something similar" can hide a real regression. Logging every fallback keeps
the suite trustworthy.

### Living proof: the `@demo` scenario

[`resilience-demo.feature`](cypress/e2e/features/resilience-demo.feature) (`013 [RESILIENCE]`) uses a
**deliberately degraded** logo selector: its primary `data-qa` does not exist, so it always falls back to the
verified `role(img, …)` strategy. The scenario asserts both that the logo is still found and that the drift event
was written correctly.

Its output is **isolated** from the real signal:
- **Tag:** it is tagged `@demo` and excluded from the default run (`env.tags = 'not @demo'`).
- **Separate log:** its definition is wrapped in `demoSelector()`, which routes its events to
  `demo-drift-log.ndjson`.
- **Separate resets:** each run only resets the log it writes to.

Without that isolation, a permanent "always drifts" scenario would train everyone to ignore the drift log.
`npm run cy:demo` runs it on its own.

Full detail: [`docs/testing-architecture.md`](docs/testing-architecture.md).

## AI-assisted CI/CD

Three GitHub Actions workflows live in [`.github/workflows/`](.github/workflows):

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [`ci.yml`](.github/workflows/ci.yml) | Push / PR to `main` | `npm ci` → `lint:scenarios` → `lint:selectors` → `typecheck` → `cy:run` (main suite only). It uploads screenshots/videos on failure, and the drift log on every run. |
| [`weekly-report.yml`](.github/workflows/weekly-report.yml) | Mondays 08:00 UTC, or manually | Runs the suite and emails a report. |
| [`pr-review.yml`](.github/workflows/pr-review.yml) | PR to `main` opened/updated, and on merge | Claude Code reviews the PR, then posts a post-merge summary. |

### Weekly report

Every Monday at 08:00 UTC, the suite runs and an email goes to the address in the `GMAIL_USERNAME` repository
secret. Trigger it manually with `gh workflow run weekly-report.yml --repo leodvlpr/cypress-bdd`.

**The email contains:**
- the verdict in the subject: `(passed)` or `(FAILED)`;
- pass/fail totals and duration;
- the failed scenarios by title;
- the per-spec results table;
- the drift summary table;
- a link to the run.

**How it behaves on failure:**
- The email always goes out, even when tests fail.
- The job still turns red when the suite failed, so you get both signals.
- The report, the raw output and the drift files are also kept as a 30-day artifact.

### Claude Code PR review + post-merge summary

[`anthropics/claude-code-action`](https://github.com/anthropics/claude-code-action) runs on every pull request to
`main`. It doesn't run a generic code review: the prompt tells it to **read
[`docs/testing-architecture.md`](docs/testing-architecture.md) first** and cite the section each finding violates.

**What it checks:**
- components vs. pages;
- every lookup going through the resolver;
- selector rules and fallback evidence;
- thin step definitions;
- scenario naming;
- no fixed waits, `force` or `.only`;
- `@demo` isolation;
- English-only.

**What it posts:**
- inline comments on specific lines;
- one summary with a verdict (✅ / ⚠️ / ❌);
- after a merge, a short "merged with / without convention drift" comment.

**Real example: [PR #4](https://github.com/leodvlpr/cypress-bdd/pull/4).**
1. The first review returned **⚠️ Minor issues**, with three findings grounded in the docs:
   - a document still written in Spanish;
   - a primary selector relying on DOM nesting;
   - flows holding assertions.

   It also asked for evidence that the fallbacks target the same node.
2. After the fixes, the second pass confirmed all four were resolved, and caught one stale table that the fix
   itself had introduced.
3. The third pass returned **✅ Follows conventions**.
4. After the merge, the wrap-up posted *"✅ Merged without convention drift"*.

Two caveats:
- **The reviewer is only as good as the document it reads**, so conventions change in the docs first, then in
  the code.
- **The review is advisory:** it comments, but does not block merging.

## Tech stack

| Tool | Role |
| --- | --- |
| **Cypress 14.5** | Browser automation and test runner (Electron headless in CI). |
| **TypeScript 5.9** (strict) | Typed selector definitions, scenario data, custom commands and drift events. No `any`. |
| **Cucumber / Gherkin** | BDD scenarios via `@badeball/cypress-cucumber-preprocessor` + esbuild, with tag filtering for `@demo`. |
| **GitHub Actions** | CI on push/PR, weekly scheduled run with email report, PR review automation. |
| **Claude Code** | Automated PR review and post-merge convention check, grounded in this repo's docs. |
| **Playwright** (tooling only) | Used during development to inspect the live DOM and verify every fallback strategy. It is not a test dependency. |

## What's covered

The main suite has 12 scenarios across 7 features, run by `npm run cy:run`:

| ID | Component | Scenario |
| --- | --- | --- |
| 001 | HOME | Homepage loads and displays the site logo |
| 002 | LOGIN | Registered user logs in and sees their name in the header |
| 003 | LOGIN | Incorrect password shows the invalid credentials error |
| 004 | LOGOUT | Logged-in user returns to the login page without an active session |
| 005 | SIGNUP | New visitor creates an account and is logged in |
| 006 | SIGNUP | Already registered email shows the "email exists" error |
| 007 | SEARCH | Searched product appears in the search results |
| 008 | PRODUCT | Product detail shows name, category, price, availability, condition and brand |
| 009 | CART | Cart lists each added product with its quantity and total price |
| 010 | CART | Removed product disappears and the cart is shown as empty |
| 011 | CHECKOUT | Logged-in user places an order delivered to their profile address |
| 012 | CONTACT | Contact form submission shows the success confirmation |

The resilience demo is 1 scenario, run by `npm run cy:demo`:

| ID | Component | Scenario |
| --- | --- | --- |
| 013 | RESILIENCE | Degraded primary selector falls back to its next strategy and logs demo drift |

Not covered yet: newsletter subscription, category/brand filters, product reviews, invoice download and scroll
behaviour.

## Getting started

**Prerequisites:** Node.js 22+ (CI uses 22), and internet access to automationexercise.com.

```bash
git clone https://github.com/leodvlpr/cypress-bdd.git
cd cypress-bdd
npm ci
```

| Command | What it does |
| --- | --- |
| `npm run cy:open` | Cypress interactive mode |
| `npm run cy:run` | Main suite, headless (excludes `@demo`) |
| `npm run cy:demo` | Only the `@demo` resilience scenario |
| `npm run lint` | `lint:scenarios` + `lint:selectors` |
| `npm run lint:scenarios` | Scenario titles/IDs; prints the next free ID |
| `npm run lint:selectors` | All lookups go through `cy.getElement`, and factories use `paramSelector` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run drift:report` | Markdown summary of the last run's drift log |

Run a single feature with `npx cypress run --spec cypress/e2e/features/cart.feature`.

## Project structure

```text
cypress/
  e2e/features/            # Gherkin features (one per business area + the @demo resilience scenario)
  fixtures/                # Reference product catalog
  support/
    assertions/            # Cross-component end-state checks (signed out, drift logged)
    commands/              # cy.getElement / cy.expectAbsent resolver, API seeding commands
    components/            # One reusable UI piece per file
    data/                  # Unique per-scenario test data factories
    flows/                 # Business intents; navigation.flow.ts owns routes and cy.visit
    selectors/             # Selector definitions with ordered strategies, one file per UI piece
    step_definitions/      # Thin Gherkin bindings + hooks (user cleanup)
    types/                 # Domain, selector and drift event types
docs/
  testing-architecture.md  # The conventions (also what the PR reviewer reads)
  selector-verification.md # Same-node evidence for every fallback
  tasks/                   # Step-by-step briefs this project was built from
scripts/                   # Lint checks, drift report, weekly email report
.github/workflows/         # ci, weekly-report, pr-review
```

## Known limitations

- **It runs against a live public site.** If automationexercise.com changes or goes down, the suite fails or
  drifts. Third-party consent and ad scripts are blocked through `blockHosts`, because they overlay the page
  unpredictably.
- **The tests write real data.** Each scenario creates (and deletes) an account through the store's API, and the
  checkout scenario places a fake-payment order that cannot be deleted.
- **Some elements can only be matched by text.** The site has no `data-qa` on several of them; the needed hooks
  are listed as requests in the architecture doc.
- **The role matcher covers only five roles** (button, link, heading, img, radio). That is enough for this site;
  a library like Testing Library would be worth it only for richer widgets.

## License

[MIT](LICENSE) © 2026 Leonel Mujica

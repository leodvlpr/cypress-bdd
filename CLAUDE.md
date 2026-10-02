# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Cypress 14 + TypeScript (strict) + Cucumber (`@badeball/cypress-cucumber-preprocessor` + esbuild) E2E suite against
the public demo store https://automationexercise.com. **`docs/testing-architecture.md` is the source of truth for
conventions.** The Claude Code PR review workflow reads it to judge every PR, so when a convention changes, update
that doc in the same PR.

## Commands

```bash
npm ci
cp .env.example .env              # required: target URL, test-id attribute, test data (see Configuration)
npm run typecheck                 # tsc --noEmit
npm run lint                      # lint:scenarios + lint:selectors (both run in CI)
npm run lint:scenarios            # scenario title/ID format; prints the next free ID
npm run lint:selectors            # enforces the single selector resolver (see below)
npm run cy:run                    # main suite, headless; @demo excluded via env.tags = 'not @demo'
npm run cy:demo                   # only @demo scenarios (cypress run --env tags=@demo)
npm run cy:open                   # interactive
npm run drift:report              # cypress/.drift/drift-log.ndjson -> cypress/.drift/summary.md
npx cypress run --spec cypress/e2e/features/cart.feature   # single feature
```

There are no unit tests: verification means the typecheck, both lints, and a Cypress run.

## Architecture

```text
feature -> step definition -> flow -> component -> selector definition -> cy.getElement (resolver)
                 \-> assertions/ (Then-side end-state checks spanning components)
```

All paths below are under `cypress/support/`.

- **`step_definitions/`**: thin Gherkin bindings, no selectors or `cy.*` lookups. They live here, not in
  `e2e/`, because `.cypress-cucumber-preprocessorrc.json` points there. `hooks.ts` deletes any user a scenario
  created. Scenario state is shared via `this` (`world.ts`, `ScenarioWorld.registeredUser`).
- **`flows/`**: business intents (`signIn`, `addToCart`, `payOrder`). They declare `cy.intercept` *before* the
  action and `cy.wait('@alias')`, never fixed sleeps. `navigation.flow.ts` is the only place allowed to call
  `cy.visit` / `cy.location` (routes live there).
- **`components/`**: one reusable UI piece per file (header, signup-form, cart-table, payment-form…), never a
  whole page. They are plain objects of functions, not classes.
- **`assertions/`**: `Then`-side checks that no single component owns (signed out on the login page, drift
  event logged).
- **`selectors/`**: one `*.selectors.ts` per UI piece. Each element is
  `selector('<piece>.<element>', ...strategies)`, with strategies ordered by preference. The builders are
  `testId`, `id`, `css`, `role` and `text`, in `selectors/selector.ts`.
  - Factories **must** use `paramSelector(name, { params }, ...)`, so drift logs can tell instances apart.
    `lint:selectors` rejects plain `selector()` in a factory.
  - `testId(...)` is always primary when the element has one. The attribute comes from `TEST_ID_ATTRIBUTE`
    (`data-qa` on this site). Never use style classes, XPath,
    DOM structure or `:nth-child`.
  - `text` is only for contract text: messages, product data, and `<a>` elements without `href`, which have no
    link role. Only in those cases may `text` be the primary strategy.
  - Ancestor scoping (`[data-qa="x"] input…`, `form[action="/login"] input…`) is allowed only as a fallback.
- **`commands/selector.commands.ts`**: the **only** file allowed to call `cy.get` / `cy.contains` / `.find`.
  - `cy.getElement(def)` checks every strategy synchronously and in order on each retry, then returns a
    retryable query for the one that matched.
  - A match by a non-primary strategy passes, and `cy.task('logDrift')` records it. No match fails the test.
  - `cy.expectAbsent(def)` requires that *no* strategy matches.
  - Its custom `role` matcher covers button, link, heading, img and radio. It ignores icon-font `::before`
    glyphs, which Playwright includes in accessible names.
- **`commands/authentication.commands.ts`**: `createAccountByApi` / `deleteAccountByApi` seed a unique user per
  scenario (`data/user.factory.ts`). The store API **always returns HTTP 200 with JSON in a text/html body**, so
  the real result is the body's `responseCode`. Passwords are never logged (`log: false`,
  `failOnStatusCode: false`).

### Configuration (`.env`)

- **No app-specific values in code.** The URL, test-id attribute, blocked hosts, user profile, contact data,
  test card and catalog file come from `.env`. Every key is documented in `.env.example`, and `.env` is
  git-ignored.
- **Loading:** `cypress/config/load-config.ts` validates the config and fails before Cypress starts, listing
  missing or invalid keys. A non-empty environment variable overrides `.env`.
- **Access:** specs read it only through `appConfig()` (`cypress/support/config.ts`); `lint:selectors`
  rejects `Cypress.env(` elsewhere.
- **New keys:** add them to `AppConfig`, the loader and `.env.example`.

### Drift logging (`cypress.config.ts`)

- **Where events go:** the `logDrift` task appends NDJSON to `cypress/.drift/drift-log.ndjson`. Each event has
  `name`, `params`, `label`, `scope` (the `.within()` element), the strategy used, its index and the primary.
- **Reset:** each `cypress run` resets *only the log it writes to*, leaving an empty file. An empty file means
  no drift; the CI artifact relies on the file existing.
- **Demo isolation:** definitions wrapped in `demoSelector()` set `demo: true` and go to `demo-drift-log.ndjson`.
  Use `demoSelector()` only in `@demo` scenarios (`resilience-demo.feature`). A run counts as a demo run only
  when `env.tags === '@demo'` exactly.

### Adding or changing a selector fallback

Verify on the live site, with Playwright, that the fallback resolves to **the same DOM node** as the primary
(`el === other`). Then record it in `docs/selector-verification.md`. A clean `npm run cy:run` must leave
`drift-log.ndjson` empty; if it doesn't, a primary is wrong.

## Conventions enforced by scripts

- **Scenario titles:** `<ID> [COMPONENT] Validate <main assertion>`. IDs are 3 digits, unique, increasing and
  never reused. The allowed components are listed in `scripts/check-scenario-names.mjs`, and adding a new area
  means editing that list.
- **Language:** everything is in English: Gherkin steps, code, docs and test data.

## Gotchas

- **The site's bot protection can block CI.** After many runs it serves "Please wait while your request is
  being verified…" (`failedChecks=webdriverCheck`). The whole suite then fails at once, and the API seeding
  fails with a JSON parse error because it receives that HTML page. It is environmental; don't "fix" selectors
  for it, and avoid hammering the site with repeated runs.
- **Third-party consent and ad hosts are blocked** via `blockHosts`; otherwise they overlay the page.
- **Don't use `instanceof` on DOM elements.** They live in the app's iframe, so `instanceof HTMLInputElement`
  is always false from the spec. Compare `tagName` instead.
- **`contain.text` uses raw `textContent`.** Multi-line blocks such as the checkout address need
  whitespace-normalized comparison, which is what `cy.contains` does.
- **The contact form never sends a request.** It is client-side only: a `confirm` dialog and a success banner.
  Wait on the `window:confirm` stub, not an intercept.

## CI (`.github/workflows/`)

- **`ci.yml`:** runs on push/PR to `main`: `cp .env.example .env`, lints, typecheck, `cy:run`. It uploads the drift
  log on every run.
- **`weekly-report.yml`:** Monday 08:00 UTC, or `workflow_dispatch`. It runs the suite and emails
  `scripts/weekly-report.mjs` output via Gmail (secrets `GMAIL_USERNAME`, `GMAIL_APP_PASSWORD`).
  - The suite step uses `shell: bash`, so `pipefail` keeps `tee` from masking failures.
  - Like `schedule`, `workflow_dispatch` only works once the workflow is on `main`.
- **`pr-review.yml`:** `anthropics/claude-code-action@v1`, with secrets `ANTHROPIC_API_KEY` and
  `ANTHROPIC_BASE_URL`. The base URL is passed as step `env`.
  - On PRs to `main` it reviews against `docs/testing-architecture.md`; after a merge it posts a drift wrap-up.

## Task briefs

Step briefs live in `docs/tasks/step-*.md`. Several have arrived truncated mid-sentence, so check the end of the
file before relying on it.

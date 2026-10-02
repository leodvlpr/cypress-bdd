# Instructions for Claude Code: Reusable components for Cypress + Cucumber

## Role and objective

Act as a **Senior QA Automation Engineer**. Work on the existing repository and build only the first layer of an E2E testing framework based on **Cypress + Cucumber + Gherkin + BDD**. The architecture must be oriented to **reusable interaction components per business flow**, not the Page Object Model (POM).

The goal of this change is to leave a small, clear and extensible base for writing readable Gherkin scenarios and linking them to reusable flows/components. Do not implement GitHub Actions, email notifications, Claude review or full self-healing yet; only leave documented extension points where they add value.

> Before modifying files, inspect `package.json`, the Cypress configuration, the existing directories, the `README` and the TypeScript/ESLint configuration files. Keep the decisions and versions already adopted. Do not replace the Cucumber preprocessor or restructure the project if the current setup already works.

## Mandatory principles

1. **BDD first.** `.feature` files describe intent and observable behaviour, not selectors, internal routes or implementation details.
2. **No POM.** Do not create classes like `LoginPage`, `DashboardPage`, `BasePage`, or methods that represent a whole page. Do not hide POM under another name either.
3. **Components and flows.** Model reusable UI capabilities: `auth`, `navigation`, `form`, `modal`, `toast`, `table`, `date-picker`, etc. _Flows_ compose those capabilities to achieve a business intent, for example `signInAs()` or `createProject()`.
4. **Single responsibility.** Components encapsulate a small, stable interaction; flows orchestrate several components; step definitions translate Gherkin language into flows/actions. Do not mix these layers.
5. **Explicit, stable selectors.** Prioritise `data-testid` or `data-cy` agreed with development. Do not use XPath, selectors that depend on style classes, DOM structure, indexes (`:nth-child`) or text as the primary selector. Use visible text only when it is the accessibility/business contract being validated.
6. **Deterministic tests.** Do not use `cy.wait(1000)`, arbitrary waits, `force: true`, manual retries or dependencies between scenarios. Wait for an observable condition, a network alias or an accessible state.
7. **Strict TypeScript.** Respect the existing configuration. Do not introduce `any` without a localised justification. Add types for scenario data, responses and custom commands.
8. **Minimal changes.** Add only essential dependencies. Do not change global timeout rules to work around local flakiness.

## Target architecture

Adapt names and extensions to the repository's real structure, but preserve these responsibilities:

```text
cypress/
  e2e/
    features/
      authentication.feature
    step-definitions/
      authentication.steps.ts
  support/
    commands/
      authentication.commands.ts
      ui.commands.ts
      index.ts
    components/
      auth.component.ts
      navigation.component.ts
      feedback.component.ts
    flows/
      authentication.flow.ts
    selectors/
      auth.selectors.ts
    types/
      cypress.d.ts
    e2e.ts
  fixtures/
```

If the preprocessor requires another location for features or step definitions, keep its convention. The separation of responsibilities is mandatory.

### 1. Selectors (`support/selectors`)

- Centralise only `data-*` selectors that are owned and stable.
- Export them by domain, with semantic names and no Cypress logic.
- A selector must be a UI contract, for example `emailInput: '[data-cy="login-email"]'`.
- If the application does not have stable attributes yet, document which attributes development needs to add. Do not invent fragile selectors as a substitute.

### 2. Components (`support/components`)

- They must be pure Cypress orchestration functions, not classes.
- Each function operates on one capability or piece of UI and receives explicit data.
- They must run a minimal availability check before interacting and return the Cypress chain when it makes sense.
- Valid examples: `authComponent.fillCredentials()`, `authComponent.submit()`, `feedbackComponent.expectSuccessToast()`.
- Invalid examples: `loginPage.login()`, `dashboardPage.openSettings()`, or a component that navigates, authenticates and verifies all at once.

### 3. Flows (`support/flows`)

- They compose components for a reusable business intent.
- Example: `signIn({ email, password })` calls `authComponent.fillCredentials()` and `authComponent.submit()`; the initial navigation can be the explicit responsibility of the scenario or of a separate `openLogin()` flow.
- Do not put scenario-specific assertions inside a flow, except universal postconditions that are part of the flow's contract.
- The flow must not know Gherkin phrases or Cucumber tables.

### 4. Custom Commands (`support/commands`)

Use commands for universal, repeated, expressive primitives; do not turn every flow into `cy.*`.

Implement, if no equivalents exist:

- `cy.getByTestId(testId, options?)`: safely locates `[data-testid="..."]`.
- `cy.getByCy(testId, options?)`: locates `[data-cy="..."]` if that is the convention already adopted. Do not keep two new conventions without need.
- `cy.loginByApi(credentials)`: only if the backend and the test setup allow it; it must authenticate through the API in a controlled way, validate the response and not log secrets.
- `cy.setAuthSession(...)`: only if the application's session mechanism is well defined and allows isolation. Use `cy.session()` where appropriate.

Every command must have a TypeScript declaration in `cypress.d.ts`, brief JSDoc and representative usage tests. Avoid a generic command that accepts an arbitrary selector string: it only hides fragility.

### 5. Step definitions (`e2e/step-definitions`)

- They must be thin: parse Gherkin parameters, convert table data to types and call flows/components.
- They must not contain selectors, low-level HTTP requests, duplicated business logic or large assertions.
- Avoid generic steps like `When I click "X"`; favour domain vocabulary: `When the user signs in with valid credentials`.
- Define types for `DataTable` and clear validation of required fields. Invalid data must fail with a useful message.
- Do not use mutable global state between steps. If sharing scenario data is essential, use the `World`/context recommended by the installed preprocessor and clear it per scenario.

## Deliverables

1. Verify that the existing Cypress and Cucumber scripts run at least one feature. If they are missing because of an incomplete configuration, fix it with the minimal change and explain the decision.
2. Create a small, realistic reference feature: **successful authentication**. It must express the behaviour, for example:

```gherkin
@smoke @authentication
Feature: Authentication

  Scenario: A registered user accesses their private area
    Given a registered user with valid credentials exists
    When they sign in
    Then they access their private area
```

Do not implement steps that assume data/products the repository does not have. Adapt the feature to the application's real domain. If there is no app or environment available, mark the feature as a template/documentation and explain which contracts are missing.

3. Implement the minimal set of selector + component + flow + step definitions needed for that feature, following the layers above.
4. Implement the strictly necessary custom commands and their TypeScript declarations.
5. Add short documentation to the existing `README`, or to `docs/testing-architecture.md` if there is no suitable section yet, explaining:
   - the `feature → step definition → flow → component → selector/command` flow;
   - the convention for new selectors;
   - when to create a component, flow or command;
   - how to run the reference feature locally.
6. Add or update a test data strategy for the example. Priority: idempotent API/seeding or a controlled fixture. Never real credentials or production data in the repository.

## Network and data handling

- For critical E2E, use the real backend in a controlled test environment when feasible; observe relevant endpoints with `cy.intercept()` and wait for the alias, not a fixed duration.
- Use _stubs_ with `cy.intercept()` for errors, latency and edge cases; not to turn the whole E2E suite into a test isolated from the backend.
- Declare `cy.intercept()` before the action that triggers the request, especially before `cy.visit()` if the request happens on page load.
- Scenarios must create and clean up their data, or use idempotent data with unique identifiers. Parallel execution must not cause collisions.
- Do not expose tokens, passwords, connection strings or PII in logs, screenshots, videos, fixtures or error messages.

## Preparing for maintenance and self-healing (without implementing it yet)

Design so that UI changes are localised in selector/component files. Do **not** add AI, silent auto-repair, fallback to multiple selectors or tests that pass without verifying the expected behaviour.

Leave, at most, a documentation section with this future policy:

1. Detect a broken selector and collect evidence (DOM, screenshot, request/response, run history).
2. Propose a repair using test attributes and human review.
3. Run validation in CI and open a PR; never modify selectors or accept results automatically on `main`.
4. Measure flakiness rate, repaired failures and false positives.

The reason matters: a mechanism that "finds something similar" can hide a real regression and reduce the suite's credibility.

## Quality, verification and delivery

Before finishing:

1. Run the available type check, lint and formatting.
2. Run the reference feature/spec in headless mode if an application/environment is configured. If it cannot run, do not simulate success: state exactly the command attempted, the blocker and what is missing.
3. Check that each scenario passes independently and contains no `cy.wait(<number>)`, `force: true`, `.only`, hard-coded credentials or presentational CSS selectors.
4. Review the diff to make sure no files outside this scope were modified.
5. Deliver a summary with: files created/modified, resulting architecture, commands run, results and any decision/limitation that needs human review.

## Acceptance criteria

- A readable reference Gherkin feature exists, with thin step definitions.
- Interaction is organised as selector → component → flow → step definition, with no Page Object classes or "page" functions.
- The necessary custom commands are typed and do not duplicate flows.
- There are no fixed waits or fragile selectors in the new files.
- The documentation lets another engineer extend the framework consistently.
- The validation run and its results are reported honestly.

## Out of scope for this iteration

- Weekly GitHub Actions workflow and email.
- Automated PR review with Claude.
- AI self-healing implementation.
- Full UI/API coverage, reports, visual testing, performance or accessibility.

After delivering this base, wait for confirmation before implementing any of those blocks.

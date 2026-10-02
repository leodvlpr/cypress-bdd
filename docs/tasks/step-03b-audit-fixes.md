# Step 3b — Fix Architecture Debt Found in Step 3 Audit

## Context

A full audit of Steps 2-3 (see docs/tasks/step-03-audit.md) found a solid base
(TypeScript clean, 12/12 passing, spot-checked selectors confirmed against the
real site) but real deviations from the component-based, no-POM architecture.
This step resolves those findings before Step 4 (resilient selectors + drift
logging) builds on top. Branch feat/bdd-component-flows / PR #1 is where this
work continues.

## Policy clarification (apply this, it overrides anything stricter inferred

## during Steps 2-3)

Fallback selectors WITH logging of which strategy was used are the agreed
"self-healing" scope for this project. Only SILENT auto-repair (code rewriting
itself without a human reviewing it) was rejected. Don't avoid implementing
fallback logic — the goal of this cleanup step is to make fallback possible by
creating a single point of selector resolution, not to eliminate fallback as a
concept.

## 1. Split components by reusable UI piece, not by domain/page

- `cart`: split the "Added!" modal (appears on product detail pages) from the
  cart page table + checkout button. These are two different UI pieces in two
  different contexts.
- `navigation`: split the Header (logout, session indicator — real UI) from the
  5 `cy.visit` route calls (not UI, these are navigation/flow concerns — move
  them to wherever flows/step definitions already live, not inside a
  "component").
- `catalog`: split into a ProductSearch piece (search bar + results on
  /products) and a ProductDetail piece (/product_details). Two different
  screens, two different pieces.
- `checkout`: split into an Address/OrderComment piece (/checkout) and a
  Payment piece (/payment, card + submit).
- `registration`: break up the page-object-like structure into: the small
  signup form on /login (name + email), the full account details form on
  /signup (the 15 fields), and the confirmation step — as separate, composable
  pieces, not one object mirroring the whole /signup screen.

Keep `auth` and `contact` as-is — the audit confirmed those are already proper
reusable UI pieces.

## 2. Fix policy violations found in the audit

- `smoke.steps.ts`: the logo check uses a raw CSS class selector
  (`.logo img[alt=...]`) directly in the step, bypassing components/selectors
  entirely. Move it to use a proper selector definition and a component method
  (e.g. a Home or Header component), consistent with how every other scenario
  works.
- `smoke.feature`: rewrite the scenario's wording to match the domain-language
  style used in scenarios 002-012 (drop the generic "As a developer / I visit
  the homepage" framing). Rename/merge it to fit the `[HOME]` naming convention
  already established (it's currently scenario 001 `[HOME] Validate homepage
loads and displays the site logo` per the audit — keep that identity, just
  fix how it resolves the selector).
- `authentication.steps.ts:51`: move the direct `cy.location('pathname')`
  check out of the step definition and into a component/helper method (e.g. an
  `isLoggedIn()` or

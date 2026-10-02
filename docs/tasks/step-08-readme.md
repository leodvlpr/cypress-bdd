# Step 8 — README & Documentation

## Context

All prior steps are complete: a Cypress + TypeScript + Cucumber/Gherkin BDD
framework against automationexercise.com, component-based architecture (no
POM), resilient/fallback selectors with drift logging (documented in
docs/testing-architecture.md), a permanent @demo scenario proving the
resilience mechanism, CI on push/PR, a weekly scheduled run with an emailed
report, and Claude Code performing automated PR review + post-merge summaries.

## Objective

Write a README.md that works as a portfolio piece — this project has two real
AI-related differentiators (automated PR review, and the resilient-selector/
drift-logging mechanism) and both deserve honest, specific explanation, not
hype.

## Before writing anything

Inspect the actual repo state — do not invent numbers or claims:

- Count real feature files, scenarios, and components
  (`find cypress/e2e/features -name "*.feature"`, count scenarios within them,
  `find cypress/support/components -name "*.ts"`).
- Run `npm run cy:run` and capture the real pass count/duration (excluding
  @demo).
- Run `npm run cy:demo` separately and note it as the dedicated resilience
  demonstration, not part of the main count.
- Read the actual workflow files (ci.yml, weekly-report.yml, pr-review.yml) to
  describe them accurately.

## README structure

1. **Header**: project title, one-line pitch. Be explicit this targets a
   public demo app (automationexercise.com), not a client/employer codebase.

2. **Badges**: CI status badge (from ci.yml), TypeScript badge, Cypress badge,
   Cucumber/BDD badge, license badge — shields.io, only for things actually
   true.

3. **Why component-based, not POM**: explain the architectural choice and
   why it fits BDD better (step definitions compose reusable UI pieces across
   flows rather than one object per screen). Include a short code snippet
   showing a step definition using two different components together.

4. **BDD with Cucumber**: explain the Gherkin approach, link to one real
   .feature file as an example, and note the scenario-naming convention
   established during the project.

5. **Resilient selectors & drift logging** (give this real space — this is
   the most technically interesting part): explain the ordered-fallback
   strategy mechanism, what gets logged and why (name, params, scope, label),
   and be explicit about scope honesty: this is NOT AI-powered self-healing
   that silently rewrites code — it's deterministic fallback with transparent
   logging, reviewed by a human (or by the Claude Code PR review) rather than
   auto-applied. Link to docs/testing-architecture.md for full detail. Mention
   the @demo scenario as living proof of the mechanism, and explain why its
   output is isolated from the real drift signal.

6. **AI-assisted CI/CD**: cover both automated pieces — the weekly scheduled
   report (what it contains, where it's sent) and the Claude Code PR review +
   post-merge summary (what it checks, grounded in this repo's own
   documented conventions, not generic review). If a PR from the Step 7
   verification is still visible, link it as a real example.

7. **Tech stack table**: Cypress, TypeScript, Cucumber/Gherkin, GitHub
   Actions, Claude Code — one line each on the role it plays.

8. **What's covered**: real scenario list derived from the actual feature
   files (auth, cart, checkout, contact, registration, etc.), not a generic
   "comprehensive coverage" claim.

9. **Getting started**: clone, `npm install`, `npm run cy:open` /
   `npm run cy:run`, `npm run cy:demo`, `npm run lint`, `npm run lint:selectors`
   — pulled from the

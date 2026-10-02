# Step 5 — Basic CI

## Objective

Run the suite automatically on push/PR to main: lint, typecheck, and the main
Cypress suite (the @demo-tagged resilience scenario is excluded by default
already, per Step 4's config — no extra handling needed here).

## Build

Create `.github/workflows/ci.yml`:

\`\`\`yaml
name: Cypress BDD Suite

on:
push:
branches: [main]
pull_request:
branches: [main]

jobs:
test:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with:
node-version: 22
cache: 'npm' - name: Install dependencies
run: npm ci - name: Lint
run: npm run lint - name: Lint selectors
run: npm run lint:selectors - name: Typecheck
run: npx tsc --noEmit - name: Run Cypress suite
run: npm run cy:run - name: Upload Cypress artifacts on failure
if: failure()
uses: actions/upload-artifact@v4
with:
name: cypress-artifacts
path: |
cypress/screenshots
cypress/videos
retention-days: 7 - name: Upload drift log
if: always()
uses: actions/upload-artifact@v4
with:
name: drift-log
path: cypress/.drift/drift-log.ndjson
retention-days: 30
if-no-files-found: ignore
\`\`\`

Confirm the exact npm script names (`lint`, `lint:selectors`, `cy:run`) match
what actually exists in package.json — adjust the workflow if any differ from
what's referenced here.

## Verification

1. Push this workflow on a new branch, open a PR via `gh pr create`.
2. Confirm the job runs and passes.
3. Confirm the drift-log artifact is produced (even if empty/minimal) and the
   @demo scenario did NOT run as part of this job (check the Cypress run
   output — scenario count should match the main suite, not main+demo).
4. Do not merge the PR — leave it open for review.

## On completion

Give a summary: PR URL, confirmation of job success, and confirmation that the
@demo scenario was excluded from this CI run (show the scenario count from the
Cypress output).

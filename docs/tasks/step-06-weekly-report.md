# Step 6 — Weekly Scheduled Run with Email Report

## Objective

A GitHub Action that runs the full suite once a week, generates a readable
report combining test results and the drift summary (from Step 4's
drift-report script), and emails it.

## Build

Create `.github/workflows/weekly-report.yml`:

\`\`\`yaml
name: Weekly Test Report

on:
schedule: - cron: '0 8 \* \* 1' # Every Monday 08:00 UTC
workflow_dispatch: {} # allows manual trigger for testing

jobs:
weekly-run:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with:
node-version: 22
cache: 'npm' - name: Install dependencies
run: npm ci

      - name: Run Cypress suite
        id: suite
        continue-on-error: true
        run: npm run cy:run | tee cypress-output.log

      - name: Generate drift report
        run: npx ts-node scripts/drift-report.ts
        continue-on-error: true

      - name: Build email body
        id: email
        run: |
          echo "body<<EOF" >> "$GITHUB_OUTPUT"
          echo "## Weekly Test Report — $(date -u +%Y-%m-%d)" >> "$GITHUB_OUTPUT"
          echo "" >> "$GITHUB_OUTPUT"
          echo "### Suite result" >> "$GITHUB_OUTPUT"
          tail -n 30 cypress-output.log >> "$GITHUB_OUTPUT"
          echo "" >> "$GITHUB_OUTPUT"
          echo "### Drift summary" >> "$GITHUB_OUTPUT"
          cat cypress/.drift/summary.md >> "$GITHUB_OUTPUT" 2>/dev/null || echo "No drift summary generated." >> "$GITHUB_OUTPUT"
          echo "EOF" >> "$GITHUB_OUTPUT"

      - name: Send email report
        if: always()
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 465
          username: ${{ secrets.GMAIL_USERNAME }}
          password: ${{ secrets.GMAIL_APP_PASSWORD }}
          subject: "Weekly Test Report — automationexercise-cypress-bdd (${{ steps.suite.outcome }})"
          to: ${{ secrets.GMAIL_USERNAME }}
          from: Cypress BDD Framework <${{ secrets.GMAIL_USERNAME }}>
          body: ${{ steps.email.outputs.body }}

      - name: Fail the job if the suite failed
        if: steps.suite.outcome == 'failure'
        run: exit 1

\`\`\`

Notes on the design:

- `continue-on-error: true` on the suite run + the explicit failing step at the
  end means the email always sends (even when tests fail), but the job still
  shows red in the Actions tab when there's a real failure — you get both
  signals.
- Confirm the exact path/invocation for `scripts/drift-report.ts` matches what
  Step 4 actually produced (adjust the command if it's run differently, e.g.
  plain `node` instead of `ts-node`, or a different output path than
  `cypress/.drift/summary.md`).
- `tail -n 30` on the Cypress output keeps the email readable — adjust if the
  real output format needs a different slice to show a useful summary (pass/
  fail counts, scenario names on failure).

## Verification

1. Trigger manually via `gh workflow run weekly-report.yml` (uses
   `workflow_dispatch`, no need to wait for Monday).
2. Confirm the email arrives with both sections (test result + drift summary)
   and that the subject line reflects pass/fail correctly.
3. Leave the cron schedule as-is for the real weekly run going forward.

## On completion

Give a summary: confirmation the manual trigger worked, that the email arrived
with readable content, and the exact command you used to manually trigger it
(for future reference).

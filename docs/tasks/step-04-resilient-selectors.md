# Step 4 — Resilient Selectors + Drift Logging

## Context

Step 3b consolidated selector resolution into a single point
(`cy.getByQa`/equivalent) and gave selector definitions a consistent shape
(logical name, strategy type, value). This step adds ordered fallback
strategies per selector and logs whenever a non-primary strategy resolves an
element — the agreed, honest scope of "self-healing" for this project (NOT
silent auto-repair).

## 1. Define the strategy/registry shape

In `cypress/support/selectors/` (building on Step 3b's consolidation), each
selector definition becomes an ordered array of strategies, e.g.:

\`\`\`ts
type Strategy =
| { type: 'data-qa'; value: string }
| { type: 'id'; value: string }
| { type: 'role'; value: { role: string; name: string } }
| { type: 'text'; value: string };

interface SelectorDefinition {
name: string; // logical name, e.g. "checkout.placeOrderButton"
strategies: Strategy[]; // tried in order, first match wins
}
\`\`\`

Before assigning fallback strategies to any REAL (non-demo) selector, use
Playwright MCP to navigate the actual pages on automationexercise.com and
confirm each fallback strategy genuinely identifies the same element — do not
invent plausible-sounding fallbacks. For the ~25 former `cy.contains(text)`
lookups migrated in Step 3b, prefer `role+name` as primary where the element
has a real accessible role (buttons, links) with `text` as the fallback,
rather than text-only with no fallback at all.

## 2. Build the resolution command

Create/extend the custom command (e.g. `cy.findElement(logicalName)`) so it:

1. Looks up the ordered strategies for `logicalName`.
2. Tries each strategy in order with a short existence check (don't wait the
   full default timeout on each failed strategy — fail fast to the next one).
3. On success with the FIRST strategy: proceed normally, no logging.
4. On success with any OTHER strategy: proceed (test still passes), but call
   a `cy.task('logDrift', {...})` with `{ name, strategyUsed, strategyIndex,
timestamp, specPath }`.
5. If every strategy fails: let Cypress fail normally — never swallow a total
   failure.

## 3. Wire the drift log sink

In `setupNodeEvents` (cypress.config.ts):

- Register a `logDrift` task that appends one JSON line per event to
  `cypress/.drift/drift-log.ndjson` (create the directory if missing).
- Register a `resetDriftLog`

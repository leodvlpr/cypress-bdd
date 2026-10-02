// Builds the weekly email report (Markdown) from the Cypress run output and the drift summary.
// Usage: node scripts/weekly-report.mjs <cypressOutputLog> <driftSummaryMd> <reportOut>
// Env: SUITE_OUTCOME (success|failure), GITHUB_SERVER_URL / GITHUB_REPOSITORY / GITHUB_RUN_ID for the run link.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [logPath = 'cypress-output.log', summaryPath = 'cypress/.drift/summary.md', reportPath = 'weekly-report.md'] =
  process.argv.slice(2);

const stripAnsi = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');
const log = existsSync(logPath) ? stripAnsi(readFileSync(logPath, 'utf8')) : '';
const lines = log.split('\n');

// Final totals line, e.g. "✔  All specs passed!  00:34  12  12  -  -  -" or "✖  1 of 7 failed (14%)  00:48  12  11  1  -  -".
const totalsLine = lines.find((line) => /^\s*[✔✖]\s+(All specs passed!|\d+ of \d+ failed)/.test(line));
// Drop the ✔/✖ marker first: it is followed by two spaces, which would otherwise shift every column.
const columns = totalsLine?.trim().replace(/^[✔✖]\s+/, '').split(/\s{2,}/) ?? [];
const toNumber = (value) => (value === undefined || value === '-' ? 0 : Number(value));
const totals = totalsLine
  ? { verdict: columns[0], duration: columns[1], tests: toNumber(columns[2]), passing: toNumber(columns[3]), failing: toNumber(columns[4]), pending: toNumber(columns[5]), skipped: toNumber(columns[6]) }
  : undefined;

// Failed scenarios are listed as "  1) 011 [CHECKOUT] Validate …" (titles follow the <ID> [COMPONENT] convention).
const failed = [...new Set(lines.map((line) => line.match(/^\s+\d+\) (\d{3} \[[A-Z]+\] .+?)(:)?\s*$/)?.[1]).filter(Boolean))];

// The "(Run Finished)" per-spec table, as printed by Cypress.
const finishedAt = lines.findIndex((line) => line.includes('(Run Finished)'));
// Only surrounding blank lines are dropped, so the table keeps its column alignment.
const runTable = finishedAt >= 0 ? lines.slice(finishedAt + 1).join('\n').replace(/^\s*\n/, '').trimEnd() : '';

const outcome = process.env.SUITE_OUTCOME ?? (totals && totals.failing === 0 ? 'success' : 'failure');
const passed = outcome === 'success';
const runUrl =
  process.env.GITHUB_RUN_ID && `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
const drift = existsSync(summaryPath) ? readFileSync(summaryPath, 'utf8').trim() : 'No drift summary generated.';

const report = [
  `# Weekly Test Report — ${new Date().toISOString().slice(0, 10)}`,
  '',
  `**Result: ${passed ? '✅ PASSED' : '❌ FAILED'}**` +
    (totals ? ` — ${totals.passing}/${totals.tests} tests passing, ${totals.failing} failing (${totals.verdict}, ${totals.duration})` : ' — no Cypress totals found in the output'),
  ...(runUrl ? ['', `Run: ${runUrl}`] : []),
  '',
  '## Suite result',
  '',
  ...(failed.length ? ['**Failed scenarios:**', '', ...failed.map((title) => `- ${title}`), ''] : []),
  ...(runTable ? ['```text', runTable, '```'] : ['_Cypress output not available._']),
  '',
  '## Drift summary',
  '',
  drift,
  '',
].join('\n');

writeFileSync(reportPath, report);
console.log(report);

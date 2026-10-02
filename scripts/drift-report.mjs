// Summarises cypress/.drift/drift-log.ndjson into cypress/.drift/summary.md (also printed to stdout).
// Usage: node scripts/drift-report.mjs [logPath] [summaryPath]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [logPath = 'cypress/.drift/drift-log.ndjson', summaryPath = 'cypress/.drift/summary.md'] = process.argv.slice(2);

function summarise() {
  if (!existsSync(logPath)) {
    return `**No drift log found** at \`${logPath}\`: the suite may not have run.`;
  }
  const events = readFileSync(logPath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  if (events.length === 0) {
    return '**No selector drift.** Every element resolved with its primary strategy.';
  }

  // One row per selector instance (label + scope) and fallback used.
  const groups = new Map();
  for (const event of events) {
    const key = [event.label ?? event.name, event.scope ?? '', event.primaryStrategy, event.strategyUsed].join('\u0000');
    const group = groups.get(key) ?? { event, count: 0, specs: new Set() };
    group.count += 1;
    group.specs.add(event.specPath);
    groups.set(key, group);
  }
  const selectors = new Set(events.map((event) => event.name));
  const escape = (value) => String(value).replaceAll('|', '\\|');
  const rows = [...groups.values()]
    .sort((a, b) => b.count - a.count)
    .map(({ event, count, specs }) =>
      `| \`${escape(event.label ?? event.name)}\` | ${event.scope ? `\`${escape(event.scope)}\`` : '—'} | \`${escape(event.primaryStrategy)}\` | \`${escape(event.strategyUsed)}\` (#${event.strategyIndex}) | ${count} | ${[...specs].map((s) => `\`${s}\``).join(', ')} |`,
    );

  return [
    `**${events.length} drift event(s) across ${selectors.size} selector(s).** The tests passed through fallbacks, but these primary strategies no longer match:`,
    '',
    '| Selector | Scope | Primary (not found) | Resolved with | Occurrences | Specs |',
    '| --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
    'Review each one and update the selector definition (or request the missing `data-qa`) in a PR.',
  ].join('\n');
}

const summary = summarise();
writeFileSync(summaryPath, `${summary}\n`);
console.log(summary);

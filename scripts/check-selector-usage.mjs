// Enforces the single point of selector resolution: element lookups only through cy.getElement,
// navigation (cy.visit / cy.location) only in the navigation flow, and configuration only through appConfig().
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SUPPORT_DIR = 'cypress/support';
const RULES = [
  { pattern: /\bcy\.get\((?!\s*['"`]@)/, allowedIn: ['commands/selector.commands.ts'], hint: 'use cy.getElement(definition)' },
  { pattern: /\.contains\(/, allowedIn: ['commands/selector.commands.ts'], hint: 'use cy.getElement with a text() strategy' },
  { pattern: /(\)|^\s*)\.find\(/, allowedIn: ['commands/selector.commands.ts'], hint: 'scope with .within() and cy.getElement' },
  { pattern: /\bcy\.getByQa\(/, allowedIn: [], hint: 'cy.getByQa was replaced by cy.getElement' },
  { pattern: /\bcy\.(visit|location)\(/, allowedIn: ['flows/navigation.flow.ts'], hint: 'use the navigation flow' },
  { pattern: /\bCypress\.env\(/, allowedIn: ['config.ts'], hint: 'read configuration through appConfig()' },
];

const files = readdirSync(SUPPORT_DIR, { recursive: true }).filter((file) => file.endsWith('.ts'));
const errors = [];

for (const file of files) {
  readFileSync(join(SUPPORT_DIR, file), 'utf8')
    .split('\n')
    .forEach((line, index) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      for (const rule of RULES) {
        if (rule.pattern.test(line) && !rule.allowedIn.includes(file)) {
          errors.push(`${SUPPORT_DIR}/${file}:${index + 1} ${line.trim()}  → ${rule.hint}`);
        }
      }
    });
}

// A factory built with selector() would drop its arguments from drift logs.
for (const file of files.filter((f) => f.startsWith('selectors/') && f.endsWith('.selectors.ts'))) {
  const source = readFileSync(join(SUPPORT_DIR, file), 'utf8');
  for (const match of source.matchAll(/(\w+):\s*\([^)]*\)\s*=>\s*selector\(/g)) {
    errors.push(`${SUPPORT_DIR}/${file} factory "${match[1]}" uses selector() → use paramSelector() so params reach drift logs`);
  }
}

if (errors.length > 0) {
  console.error(`Selector usage check failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`${files.length} support files OK: all lookups go through cy.getElement.`);

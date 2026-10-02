// Validates scenario titles: "<ID> [COMPONENT] Validate <main assertion>".
// IDs are 3-digit, unique across all features, and new scenarios take the next free ID.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FEATURES_DIR = 'cypress/e2e/features';
const COMPONENTS = ['HOME', 'LOGIN', 'LOGOUT', 'SIGNUP', 'SEARCH', 'PRODUCT', 'CART', 'CHECKOUT', 'CONTACT', 'RESILIENCE'];
const TITLE = /^(\d{3}) \[([A-Z]+)\] Validate \S.*$/;

const featureFiles = readdirSync(FEATURES_DIR, { recursive: true })
  .filter((file) => file.endsWith('.feature'))
  .map((file) => join(FEATURES_DIR, file));

const errors = [];
const seenIds = new Map();

for (const file of featureFiles) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      const scenario = line.match(/^\s*Scenario(?: Outline)?:\s*(.*)$/);
      if (!scenario) return;
      const location = `${file}:${index + 1}`;
      const title = scenario[1].trim();
      const parts = title.match(TITLE);
      if (!parts) {
        errors.push(`${location} "${title}" does not match "<ID> [COMPONENT] Validate <main assertion>"`);
        return;
      }
      const [, id, component] = parts;
      if (!COMPONENTS.includes(component)) {
        errors.push(`${location} unknown component [${component}]; allowed: ${COMPONENTS.join(', ')}`);
      }
      if (seenIds.has(id)) {
        errors.push(`${location} duplicate ID ${id} (already used at ${seenIds.get(id)})`);
      }
      seenIds.set(id, location);
    });
}

const nextId = String(Math.max(0, ...[...seenIds.keys()].map(Number)) + 1).padStart(3, '0');

if (errors.length > 0) {
  console.error(`Scenario title check failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`${seenIds.size} scenarios OK. Next free ID: ${nextId}`);

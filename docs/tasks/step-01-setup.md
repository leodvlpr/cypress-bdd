# Step 1 — Repo Setup: Cypress + TypeScript + Cucumber BDD

## Objective

Initialize a new public repo for a Cypress + TypeScript + Cucumber/Gherkin BDD
framework targeting https://automationexercise.com. This step only sets up
tooling and validates the wiring with one smoke scenario — no real page/component
coverage yet (that's Step 2+).

## Steps

1. Create the repo:
   \`\`\`bash
   mkdir automationexercise-cypress-bdd
   cd automationexercise-cypress-bdd
   git init
   gh repo create automationexercise-cypress-bdd --public --source=. --remote=origin
   \`\`\`

2. Init the project and install dependencies:
   \`\`\`bash
   npm init -y
   npm install -D cypress typescript @types/node \
    @badeball/cypress-cucumber-preprocessor \
    @bahmutov/cypress-esbuild-preprocessor esbuild
   \`\`\`

3. Create `tsconfig.json`. Note: use modern TS 6 syntax — do NOT use
   `moduleResolution: "node"` or `baseUrl` (both deprecated in TS 6), and
   explicitly set `types` or `process`/Node globals won't resolve:
   \`\`\`json
   {
   "compilerOptions": {
   "target": "ES2022",
   "module": "commonjs",
   "types": ["cypress", "node"],
   "strict": true,
   "esModuleInterop": true,
   "skipLibCheck": true,
   "resolveJsonModule": true,
   "paths": {
   "@components/_": ["./cypress/support/components/_"],
   "@commands/_": ["./cypress/support/commands/_"]
   }
   },
   "include": ["cypress/**/*.ts", "cypress.config.ts"]
   }
   \`\`\`

4. Create `cypress.config.ts` wiring the Cucumber preprocessor:
   \`\`\`ts
   import { defineConfig } from 'cypress';
   import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
   import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
   import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';

   export default defineConfig({
   e2e: {
   baseUrl: 'https://automationexercise.com',
   specPattern: 'cypress/e2e/features/\*_/_.feature',
   async setupNodeEvents(on, config) {
   await addCucumberPreprocessorPlugin(on, config);
   on(
   'file:preprocessor',
   createBundler({
   plugins: [createEsbuildPlugin(config)],
   })
   );
   return config;
   },
   },
   });
   \`\`\`

5. Create `.cypress-cucumber-preprocessorrc.json`:
   \`\`\`json
   {
   "stepDefinitions": "cypress/support/step_definitions/\*_/_.ts"
   }
   \`\`\`

6. Create the folder structure (empty dirs are fine, we populate in Step 2+):
   \`\`\`bash
   mkdir -p cypress/e2e/features
   mkdir -p cypress/support/components
   mkdir -p cypress/support/commands
   mkdir -p cypress/support/step_definitions
   mkdir -p docs/tasks
   \`\`\`

7. Create `cypress/support/e2e.ts` (empty for now, required entry point):
   \`\`\`ts
   // Global support file — custom commands get imported here in later steps.
   \`\`\`

8. `.gitignore`:
   \`\`\`
   node_modules/
   cypress/videos/
   cypress/screenshots/
   cypress/downloads/
   .env
   \`\`\`

9. `package.json` scripts:
   \`\`\`json
   {
   "scripts": {
   "cy:open": "cypress open",
   "cy:run": "cypress run",
   "typecheck": "tsc --noEmit"
   }
   }
   \`\`\`

10. Smoke test to validate the full chain works — create
    `cypress/e2e/features/smoke.feature`:
    \`\`\`gherkin
    Feature: Smoke test
    As a developer
    I want to confirm the Cypress + Cucumber wiring works
    So that I can start building real coverage with confidence

    Scenario: Homepage loads
    Given I visit the homepage
    Then I should see the automationexercise logo
    \`\`\`

    And `cypress/support/step_definitions/smoke.steps.ts`:
    \`\`\`ts
    import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

    Given('I visit the homepage', () => {
    cy.visit('/');
    });

    Then('I should see the automationexercise logo', () => {
    cy.get('img[alt="Website for automation practice"]').should('be.visible');
    });
    \`\`\`
    Before trusting that selector, use Playwright MCP to navigate to
    https://automationexercise.com and confirm the real logo element's actual
    attributes — don't assume the alt text above is correct, verify it.

11. Run the smoke test and confirm it passes:
    \`\`\`bash
    npx cypress run
    \`\`\`

12. Commit and push:
    \`\`\`bash
    git add .
    git commit -m "chore: initial Cypress + TypeScript + Cucumber setup"
    git push -u origin main
    \`\`\`

## On completion

Confirm: the smoke scenario passes, report the real repo URL, and confirm which
selector you ended up using for the logo check (in case my placeholder above
didn't match reality).

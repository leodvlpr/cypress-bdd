import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';
import { DEMO_DRIFT_LOG, DRIFT_LOG } from './cypress/support/drift';
import type { DriftEvent } from './cypress/support/types/drift';

export default defineConfig({
  e2e: {
    baseUrl: 'https://automationexercise.com',
    specPattern: 'cypress/e2e/features/**/*.feature',
    // @demo scenarios deliberately degrade selectors; they only run through `npm run cy:demo`.
    env: { tags: 'not @demo' },
    // Third-party consent dialog and ads overlay the app non-deterministically; they are not under test.
    blockHosts: [
      'fundingchoicesmessages.google.com',
      '*.googlesyndication.com',
      '*.doubleclick.net',
      '*.adtrafficquality.google',
    ],
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      // Drift logs: one JSON line per element resolved by a non-primary selector strategy.
      // Demo definitions write to their own file so they never mix with the real drift signal.
      const logPath = (demo?: boolean) => path.join(config.projectRoot, demo ? DEMO_DRIFT_LOG : DRIFT_LOG);
      // Reset leaves an empty file rather than none, so "exists and empty" means a clean run.
      const resetDriftLog = ({ demo }: { demo?: boolean } = {}) => {
        mkdirSync(path.dirname(logPath(demo)), { recursive: true });
        writeFileSync(logPath(demo), '');
        return null;
      };
      on('task', {
        logDrift(event: DriftEvent) {
          const file = logPath(event.demo);
          mkdirSync(path.dirname(file), { recursive: true });
          appendFileSync(file, `${JSON.stringify(event)}\n`);
          return null;
        },
        resetDriftLog,
      });
      // Each `cypress run` starts by emptying the log it writes to, and leaves the other one untouched.
      const demoRun = config.env.tags === '@demo';
      if (config.isTextTerminal) resetDriftLog({ demo: demoRun });

      return config;
    },
  },
});

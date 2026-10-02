import { appendFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';
import type { DriftEvent } from './cypress/support/types/drift';

export default defineConfig({
  e2e: {
    baseUrl: 'https://automationexercise.com',
    specPattern: 'cypress/e2e/features/**/*.feature',
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

      // Drift log: one JSON line per element resolved by a non-primary selector strategy.
      const driftLog = path.join(config.projectRoot, 'cypress', '.drift', 'drift-log.ndjson');
      const resetDriftLog = () => {
        rmSync(driftLog, { force: true });
        return null;
      };
      on('task', {
        logDrift(event: DriftEvent) {
          mkdirSync(path.dirname(driftLog), { recursive: true });
          appendFileSync(driftLog, `${JSON.stringify(event)}\n`);
          return null;
        },
        resetDriftLog,
      });
      // Each `cypress run` starts with an empty log, so it only reflects the current run.
      if (config.isTextTerminal) resetDriftLog();

      return config;
    },
  },
});

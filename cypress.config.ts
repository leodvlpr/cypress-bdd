import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';

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
      return config;
    },
  },
});

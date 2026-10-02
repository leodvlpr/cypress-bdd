import type { AppConfig } from './types/config';

/**
 * The target application and test data configuration (from .env), injected by cypress.config.ts as
 * `env.app`. This is the only place specs read Cypress.env (enforced by lint:selectors).
 */
export function appConfig(): AppConfig {
  const config = Cypress.env('app') as AppConfig | undefined;
  if (!config) throw new Error('Missing app configuration: cypress.config.ts must inject it as env.app.');
  return config;
}

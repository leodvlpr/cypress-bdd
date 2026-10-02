import type { RegisteredUser } from './types/account';

/**
 * Per-scenario state shared between steps through the preprocessor's `this`.
 * Mocha's context outlives a single test, so hooks.ts clears it after every scenario.
 */
export interface ScenarioWorld extends Mocha.Context {
  registeredUser?: RegisteredUser;
}

export function requireRegisteredUser(world: ScenarioWorld): RegisteredUser {
  if (!world.registeredUser) {
    throw new Error('No registered user in this scenario. Start it with a step that registers or seeds a user.');
  }
  return world.registeredUser;
}

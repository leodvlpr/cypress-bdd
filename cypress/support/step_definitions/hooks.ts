import { After } from '@badeball/cypress-cucumber-preprocessor';
import type { ScenarioWorld } from '../world';

// Deletes any user the scenario created, then clears the scenario state.
After(function (this: ScenarioWorld) {
  const user = this.registeredUser;
  if (!user) return;
  cy.deleteAccountByApi(user.credentials).then(() => {
    delete this.registeredUser;
  });
});

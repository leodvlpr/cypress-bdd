import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { navigationComponent } from '../components/navigation.component';
import { registrationComponent } from '../components/registration.component';
import { buildUniqueUser } from '../data/user.factory';
import { registerNewUser, startSignup } from '../flows/registration.flow';
import { requireRegisteredUser, type ScenarioWorld } from '../world';

When('un visitante se registra con datos nuevos', function (this: ScenarioWorld) {
  const user = buildUniqueUser();
  registerNewUser(user);
  // The account exists from here on, so hooks.ts must clean it up even if later checks fail.
  cy.then(() => {
    this.registeredUser = user;
  });
});

When('un visitante intenta registrarse con el email de ese usuario', function (this: ScenarioWorld) {
  startSignup('Otro visitante', requireRegisteredUser(this).credentials.email);
});

Then('su cuenta queda creada con la sesión iniciada', function (this: ScenarioWorld) {
  registrationComponent.expectAccountCreated();
  // The session indicator is only rendered once the user leaves the confirmation page.
  registrationComponent.continueToStore();
  navigationComponent.expectLoggedInAs(requireRegisteredUser(this).name);
});

Then('se le informa de que el email ya está registrado', () => {
  registrationComponent.expectEmailAlreadyExistsError();
});

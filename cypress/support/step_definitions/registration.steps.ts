import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { accountCreatedComponent } from '../components/account-created.component';
import { headerComponent } from '../components/header.component';
import { signupFormComponent } from '../components/signup-form.component';
import { buildUniqueUser } from '../data/user.factory';
import { registerNewUser, startSignup } from '../flows/registration.flow';
import { requireRegisteredUser, type ScenarioWorld } from '../world';

When('a visitor signs up with new details', function (this: ScenarioWorld) {
  const user = buildUniqueUser();
  registerNewUser(user);
  // The account exists from here on, so hooks.ts must clean it up even if later checks fail.
  cy.then(() => {
    this.registeredUser = user;
  });
});

When("a visitor tries to sign up with that user's email", function (this: ScenarioWorld) {
  startSignup('Another Visitor', requireRegisteredUser(this).credentials.email);
});

Then('the account is created and the user is logged in', function (this: ScenarioWorld) {
  accountCreatedComponent.expectVisible();
  // The session indicator is only rendered once the user leaves the confirmation page.
  accountCreatedComponent.continue();
  headerComponent.expectLoggedInAs(requireRegisteredUser(this).name);
});

Then('the visitor is told the email is already registered', () => {
  signupFormComponent.expectEmailExistsError();
});

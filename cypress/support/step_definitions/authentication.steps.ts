import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { authComponent } from '../components/auth.component';
import { headerComponent } from '../components/header.component';
import { buildUniqueUser } from '../data/user.factory';
import { expectSignedOutOnLoginPage, openLogin, signIn, signOut } from '../flows/authentication.flow';
import { requireRegisteredUser, type ScenarioWorld } from '../world';

Given('a registered user with valid credentials', function (this: ScenarioWorld) {
  const user = buildUniqueUser();
  cy.createAccountByApi(user).then(() => {
    this.registeredUser = user;
  });
});

Given('a registered user is logged in', function (this: ScenarioWorld) {
  const user = buildUniqueUser();
  cy.createAccountByApi(user).then(() => {
    this.registeredUser = user;
    openLogin();
    signIn(user.credentials);
    headerComponent.expectLoggedInAs(user.name);
  });
});

When('the user logs in', function (this: ScenarioWorld) {
  const { credentials } = requireRegisteredUser(this);
  openLogin();
  signIn(credentials);
});

When('the user logs in with an incorrect password', function (this: ScenarioWorld) {
  const { credentials } = requireRegisteredUser(this);
  openLogin();
  signIn({ email: credentials.email, password: `${credentials.password}-wrong` });
});

When('the user logs out', () => {
  signOut();
});

Then('the user is logged in to their account', function (this: ScenarioWorld) {
  headerComponent.expectLoggedInAs(requireRegisteredUser(this).name);
});

Then('the user is told the credentials are incorrect', () => {
  authComponent.expectInvalidCredentialsError();
  headerComponent.expectLoggedOut();
});

Then('the user is back on the login page without an active session', () => {
  expectSignedOutOnLoginPage();
});

import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { authComponent } from '../components/auth.component';
import { navigationComponent } from '../components/navigation.component';
import { buildUniqueUser } from '../data/user.factory';
import { openLogin, signIn, signOut } from '../flows/authentication.flow';
import { requireRegisteredUser, type ScenarioWorld } from '../world';

Given('existe un usuario registrado con credenciales válidas', function (this: ScenarioWorld) {
  const user = buildUniqueUser();
  cy.createAccountByApi(user).then(() => {
    this.registeredUser = user;
  });
});

Given('ha iniciado sesión como usuario registrado', function (this: ScenarioWorld) {
  const user = buildUniqueUser();
  cy.createAccountByApi(user).then(() => {
    this.registeredUser = user;
    openLogin();
    signIn(user.credentials);
    navigationComponent.expectLoggedInAs(user.name);
  });
});

When('inicia sesión', function (this: ScenarioWorld) {
  const { credentials } = requireRegisteredUser(this);
  openLogin();
  signIn(credentials);
});

When('inicia sesión con una contraseña incorrecta', function (this: ScenarioWorld) {
  const { credentials } = requireRegisteredUser(this);
  openLogin();
  signIn({ email: credentials.email, password: `${credentials.password}-incorrecta` });
});

When('cierra sesión', () => {
  signOut();
});

Then('accede a su área privada', function (this: ScenarioWorld) {
  navigationComponent.expectLoggedInAs(requireRegisteredUser(this).name);
});

Then('se le informa de que las credenciales son incorrectas', () => {
  authComponent.expectInvalidCredentialsError();
  navigationComponent.expectLoggedOut();
});

Then('vuelve a la pantalla de acceso sin sesión activa', () => {
  cy.location('pathname').should('eq', '/login');
  navigationComponent.expectLoggedOut();
});

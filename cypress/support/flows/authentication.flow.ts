import { authComponent } from '../components/auth.component';
import { headerComponent } from '../components/header.component';
import type { Credentials } from '../types/account';
import { expectCurrentPath, routes, visitLogin } from './navigation.flow';

export function openLogin() {
  visitLogin();
}

/** Submits the login form and waits for the server to answer; outcome checks belong to the caller. */
export function signIn(credentials: Credentials) {
  cy.intercept({ method: 'POST', pathname: '/login' }).as('loginRequest');
  authComponent.fillCredentials(credentials);
  authComponent.submit();
  cy.wait('@loginRequest');
}

export function signOut() {
  cy.intercept({ method: 'GET', pathname: '/logout' }).as('logoutRequest');
  headerComponent.clickLogout();
  cy.wait('@logoutRequest');
}

/** Logged-out state: on the login page with no session indicator in the header. */
export function expectSignedOutOnLoginPage() {
  expectCurrentPath(routes.login);
  headerComponent.expectLoggedOut();
}

import { authComponent } from '../components/auth.component';
import { navigationComponent } from '../components/navigation.component';
import type { Credentials } from '../types/account';

export function openLogin() {
  navigationComponent.goToLogin();
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
  navigationComponent.clickLogout();
  cy.wait('@logoutRequest');
}

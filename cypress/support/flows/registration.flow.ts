import { accountDetailsFormComponent } from '../components/account-details-form.component';
import { signupFormComponent } from '../components/signup-form.component';
import type { RegisteredUser } from '../types/account';
import { visitLogin } from './navigation.flow';

/** Starts signup with name + email; the server either shows the account form or an error. */
export function startSignup(name: string, email: string) {
  visitLogin();
  cy.intercept({ method: 'POST', pathname: '/signup' }).as('signupRequest');
  signupFormComponent.fill(name, email);
  signupFormComponent.submit();
  cy.wait('@signupRequest');
}

/** Registers a brand-new user through the UI; outcome checks belong to the caller. */
export function registerNewUser(user: RegisteredUser) {
  startSignup(user.name, user.credentials.email);
  cy.intercept({ method: 'POST', pathname: '/signup' }).as('createAccountRequest');
  accountDetailsFormComponent.fill(user);
  accountDetailsFormComponent.submit();
  cy.wait('@createAccountRequest');
}

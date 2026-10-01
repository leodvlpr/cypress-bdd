import { navigationComponent } from '../components/navigation.component';
import { registrationComponent } from '../components/registration.component';
import type { RegisteredUser } from '../types/account';

/** Starts signup with name + email; the server either shows the account form or an error. */
export function startSignup(name: string, email: string) {
  navigationComponent.goToLogin();
  cy.intercept({ method: 'POST', pathname: '/signup' }).as('signupRequest');
  registrationComponent.fillNameAndEmail(name, email);
  registrationComponent.submitSignup();
  cy.wait('@signupRequest');
}

/** Registers a brand-new user through the UI; outcome checks belong to the caller. */
export function registerNewUser(user: RegisteredUser) {
  startSignup(user.name, user.credentials.email);
  cy.intercept({ method: 'POST', pathname: '/signup' }).as('createAccountRequest');
  registrationComponent.fillAccountDetails(user);
  registrationComponent.submitAccount();
  cy.wait('@createAccountRequest');
}

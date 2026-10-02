import { authSelectors } from '../selectors/auth.selectors';
import type { Credentials } from '../types/account';

export const authComponent = {
  fillCredentials({ email, password }: Credentials) {
    cy.getElement(authSelectors.loginEmailInput).should('be.visible').clear().type(email);
    cy.getElement(authSelectors.loginPasswordInput).should('be.visible').clear().type(password, { log: false });
  },

  submit() {
    return cy.getElement(authSelectors.loginSubmitButton).should('be.enabled').click();
  },

  expectInvalidCredentialsError() {
    return cy.getElement(authSelectors.invalidCredentialsError).should('be.visible');
  },
};

import { authSelectors } from '../selectors/auth.selectors';
import type { Credentials } from '../types/account';

export const authComponent = {
  fillCredentials({ email, password }: Credentials) {
    cy.getByQa(authSelectors.loginEmailInput).should('be.visible').clear().type(email);
    cy.getByQa(authSelectors.loginPasswordInput).should('be.visible').clear().type(password, { log: false });
  },

  submit() {
    return cy.getByQa(authSelectors.loginSubmitButton).should('be.enabled').click();
  },

  expectInvalidCredentialsError() {
    return cy.contains('Your email or password is incorrect!').should('be.visible');
  },
};

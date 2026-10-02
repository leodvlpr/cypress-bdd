import { signupFormSelectors } from '../selectors/signup-form.selectors';

/** The name + email form on /login that starts a registration. */
export const signupFormComponent = {
  fill(name: string, email: string) {
    cy.getElement(signupFormSelectors.nameInput).should('be.visible').clear().type(name);
    cy.getElement(signupFormSelectors.emailInput).should('be.visible').clear().type(email);
  },

  submit() {
    return cy.getElement(signupFormSelectors.submitButton).should('be.enabled').click();
  },

  expectEmailExistsError() {
    return cy.getElement(signupFormSelectors.emailExistsError).should('be.visible');
  },
};

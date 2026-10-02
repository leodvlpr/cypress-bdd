import { accountCreatedSelectors } from '../selectors/account-created.selectors';

/** The confirmation step shown once an account has been created. */
export const accountCreatedComponent = {
  expectVisible() {
    return cy.getElement(accountCreatedSelectors.heading).should('be.visible');
  },

  continue() {
    return cy.getElement(accountCreatedSelectors.continueButton).should('be.visible').click();
  },
};

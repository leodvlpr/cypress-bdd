import { orderConfirmationSelectors } from '../selectors/order-confirmation.selectors';

export const orderConfirmationComponent = {
  expectVisible() {
    cy.getElement(orderConfirmationSelectors.heading).should('be.visible');
    return cy.getElement(orderConfirmationSelectors.message).should('be.visible');
  },
};

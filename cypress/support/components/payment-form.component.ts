import { paymentFormSelectors as s } from '../selectors/payment-form.selectors';
import type { PaymentCard } from '../types/checkout';

export const paymentFormComponent = {
  fillCard(card: PaymentCard) {
    cy.getElement(s.nameOnCardInput).should('be.visible').type(card.nameOnCard);
    cy.getElement(s.cardNumberInput).type(card.number, { log: false });
    cy.getElement(s.cvcInput).type(card.cvc, { log: false });
    cy.getElement(s.expiryMonthInput).type(card.expiryMonth);
    cy.getElement(s.expiryYearInput).type(card.expiryYear);
  },

  pay() {
    return cy.getElement(s.payButton).should('be.enabled').click();
  },
};

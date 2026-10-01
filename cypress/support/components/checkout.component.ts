import { checkoutFallbackSelectors, checkoutSelectors } from '../selectors/checkout.selectors';
import type { AccountProfile } from '../types/account';
import type { PaymentCard } from '../types/checkout';

export const checkoutComponent = {
  expectDeliveryAddress(profile: AccountProfile) {
    cy.getByQa(checkoutSelectors.checkoutInfo).should('be.visible');
    cy.get(checkoutFallbackSelectors.deliveryAddress).within(() => {
      cy.contains(`${profile.firstName} ${profile.lastName}`).should('be.visible');
      cy.contains(profile.address1).should('be.visible');
      cy.contains(profile.address2).should('be.visible');
      cy.contains(`${profile.city} ${profile.state} ${profile.zipcode}`).should('be.visible');
      cy.contains(profile.country).should('be.visible');
      cy.contains(profile.mobileNumber).should('be.visible');
    });
  },

  addComment(comment: string) {
    return cy.get(checkoutFallbackSelectors.orderComment).should('be.visible').type(comment);
  },

  // No data-qa on the link yet; its accessible name is the contract.
  placeOrder() {
    return cy.contains('a', 'Place Order').should('be.visible').click();
  },

  fillCard(card: PaymentCard) {
    cy.getByQa(checkoutSelectors.nameOnCardInput).should('be.visible').type(card.nameOnCard);
    cy.getByQa(checkoutSelectors.cardNumberInput).type(card.number, { log: false });
    cy.getByQa(checkoutSelectors.cvcInput).type(card.cvc, { log: false });
    cy.getByQa(checkoutSelectors.expiryMonthInput).type(card.expiryMonth);
    cy.getByQa(checkoutSelectors.expiryYearInput).type(card.expiryYear);
  },

  pay() {
    return cy.getByQa(checkoutSelectors.payButton).should('be.enabled').click();
  },

  expectOrderPlaced() {
    cy.getByQa(checkoutSelectors.orderPlacedHeading).should('be.visible');
    return cy.contains('Congratulations! Your order has been confirmed!').should('be.visible');
  },
};

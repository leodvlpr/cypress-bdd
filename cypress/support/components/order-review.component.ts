import { orderReviewSelectors } from '../selectors/order-review.selectors';
import type { AccountProfile } from '../types/account';

/** The delivery address review and order comment before paying. */
export const orderReviewComponent = {
  expectDeliveryAddress(profile: AccountProfile) {
    cy.getElement(orderReviewSelectors.checkoutInfo).should('be.visible');
    cy.getElement(orderReviewSelectors.deliveryAddress)
      .should('be.visible')
      .and(($address) => {
        // The address block is split across lines with tabs; compare against what the user reads.
        const address = $address.text().replace(/\s+/g, ' ');
        expect(address).to.contain(`${profile.firstName} ${profile.lastName}`);
        expect(address).to.contain(profile.address1);
        expect(address).to.contain(profile.address2);
        expect(address).to.contain(`${profile.city} ${profile.state} ${profile.zipcode}`);
        expect(address).to.contain(profile.country);
        expect(address).to.contain(profile.mobileNumber);
      });
  },

  addComment(comment: string) {
    return cy.getElement(orderReviewSelectors.orderComment).should('be.visible').type(comment);
  },

  placeOrder() {
    return cy.getElement(orderReviewSelectors.placeOrderButton).should('be.visible').click();
  },
};

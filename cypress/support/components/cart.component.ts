import { cartSelectors } from '../selectors/cart.selectors';
import type { CartLine, Product } from '../types/catalog';

export const cartComponent = {
  expectAddedConfirmation() {
    return cy.get(cartSelectors.addedModal).should('be.visible').and('contain.text', 'Your product has been added to cart.');
  },

  expectLine({ product, quantity }: CartLine) {
    cy.get(cartSelectors.row(product.id)).within(() => {
      cy.contains(product.name).should('be.visible');
      // The quantity is rendered as a read-only button; its exact text is the value under test.
      cy.contains('button', new RegExp(`^\\s*${quantity}\\s*$`)).should('be.visible');
      cy.contains(`Rs. ${product.price * quantity}`).should('be.visible');
    });
  },

  remove(product: Product) {
    return cy.get(cartSelectors.row(product.id)).find(cartSelectors.removeButton(product.id)).click();
  },

  expectProductAbsent(product: Product) {
    return cy.get(cartSelectors.row(product.id)).should('not.exist');
  },

  expectEmpty() {
    return cy.get(cartSelectors.emptyCartMessage).should('be.visible').and('contain.text', 'Cart is empty!');
  },

  // No data-qa on the button yet; its accessible name is the contract.
  proceedToCheckout() {
    return cy.contains('a', 'Proceed To Checkout').should('be.visible').click();
  },
};

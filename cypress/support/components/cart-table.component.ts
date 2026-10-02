import { cartTableSelectors as s } from '../selectors/cart-table.selectors';
import type { CartLine, Product } from '../types/catalog';

/** The cart contents table and its checkout button. */
export const cartTableComponent = {
  expectLine({ product, quantity }: CartLine) {
    cy.getElement(s.row(product.id)).within(() => {
      cy.getElement(s.productName(product.name)).should('be.visible');
      cy.getElement(s.quantity(quantity)).should('be.visible');
      cy.getElement(s.lineTotal(product.price * quantity)).should('be.visible');
    });
  },

  remove(product: Product) {
    return cy.getElement(s.row(product.id)).within(() => {
      cy.getElement(s.removeButton(product.id)).click();
    });
  },

  expectProductAbsent(product: Product) {
    return cy.expectAbsent(s.row(product.id));
  },

  expectEmpty() {
    return cy.getElement(s.emptyMessage).should('be.visible').and('contain.text', 'Cart is empty!');
  },

  proceedToCheckout() {
    return cy.getElement(s.proceedToCheckoutButton).should('be.visible').click();
  },
};

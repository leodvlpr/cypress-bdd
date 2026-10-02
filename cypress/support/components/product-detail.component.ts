import { productDetailSelectors as s } from '../selectors/product-detail.selectors';
import type { Product } from '../types/catalog';

export const productDetailComponent = {
  expectDetails(product: Product) {
    cy.getElement(s.name(product.name)).should('be.visible');
    cy.getElement(s.category(product.category)).should('be.visible');
    cy.getElement(s.price(product.price)).should('be.visible');
    cy.getElement(s.availability(product.availability)).should('be.visible');
    cy.getElement(s.condition(product.condition)).should('be.visible');
    return cy.getElement(s.brand(product.brand)).should('be.visible');
  },

  setQuantity(quantity: number) {
    return cy.getElement(s.quantityInput).should('be.visible').clear().type(String(quantity));
  },

  addToCart() {
    return cy.getElement(s.addToCartButton).should('be.visible').click();
  },
};

import { catalogSelectors } from '../selectors/catalog.selectors';
import type { Product } from '../types/catalog';

export const catalogComponent = {
  search(term: string) {
    cy.get(catalogSelectors.searchInput).should('be.visible').clear().type(term);
    return cy.get(catalogSelectors.searchButton).click();
  },

  expectSearchResultsShown() {
    return cy.contains('h2', /searched products/i).should('be.visible');
  },

  // Product names are the business data under test, so visible text is the contract here.
  expectProductListed(name: string) {
    return cy.contains(name).should('be.visible');
  },

  expectProductDetails(product: Product) {
    cy.contains('h2', product.name).should('be.visible');
    cy.contains(`Category: ${product.category}`).should('be.visible');
    cy.contains(`Rs. ${product.price}`).should('be.visible');
    cy.contains(`Availability: ${product.availability}`).should('be.visible');
    cy.contains(`Condition: ${product.condition}`).should('be.visible');
    return cy.contains(`Brand: ${product.brand}`).should('be.visible');
  },

  setQuantity(quantity: number) {
    return cy.get(catalogSelectors.quantityInput).should('be.visible').clear().type(String(quantity));
  },

  // No data-qa on the button yet; its accessible name is the contract.
  addToCart() {
    return cy.contains('button', 'Add to cart').should('be.visible').click();
  },
};

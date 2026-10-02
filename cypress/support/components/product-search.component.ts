import { productSearchSelectors } from '../selectors/product-search.selectors';

/** The search bar and its results on the products listing. */
export const productSearchComponent = {
  search(term: string) {
    cy.getElement(productSearchSelectors.searchInput).should('be.visible').clear().type(term);
    return cy.getElement(productSearchSelectors.searchButton).click();
  },

  expectResultsShown() {
    return cy.getElement(productSearchSelectors.resultsHeading).should('be.visible');
  },

  expectResult(productName: string) {
    return cy.getElement(productSearchSelectors.result(productName)).should('be.visible');
  },
};

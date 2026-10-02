import { css, selector, text } from './selector';

// The search bar has no data-qa yet (requested: search-input, search-button).
export const productSearchSelectors = {
  searchInput: selector('productSearch.searchInput', css('#search_product')),
  searchButton: selector('productSearch.searchButton', css('#submit_search')),
  resultsHeading: selector('productSearch.resultsHeading', text(/searched products/i, 'h2')),
  // Product names are the business data under test, so visible text is the contract here.
  result: (productName: string) => selector('productSearch.result', text(productName)),
};

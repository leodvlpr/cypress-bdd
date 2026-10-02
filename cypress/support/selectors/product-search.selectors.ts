import { css, id, paramSelector, role, selector, text } from './selector';

// No data-qa on the search bar yet (requested: search-input, search-button).
export const productSearchSelectors = {
  searchInput: selector('productSearch.searchInput', id('search_product'), css('input[name="search"]')),
  // Icon-only button: no accessible name, so its id is the only stable hook.
  searchButton: selector('productSearch.searchButton', id('submit_search')),
  resultsHeading: selector('productSearch.resultsHeading', role('heading', 'Searched Products'), text(/searched products/i, 'h2')),
  // Product names are the business data under test, so visible text is the contract here.
  result: (productName: string) => paramSelector('productSearch.result', { productName }, text(productName)),
};

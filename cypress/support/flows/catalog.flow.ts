import { productSearchComponent } from '../components/product-search.component';
import type { Product } from '../types/catalog';
import { visitProductDetails, visitProducts } from './navigation.flow';

export function searchProduct(term: string) {
  visitProducts();
  cy.intercept({ method: 'GET', pathname: '/products', query: { search: term } }).as('searchRequest');
  productSearchComponent.search(term);
  cy.wait('@searchRequest');
}

export function openProductDetails(product: Product) {
  visitProductDetails(product.id);
}

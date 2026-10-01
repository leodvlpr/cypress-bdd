import { catalogComponent } from '../components/catalog.component';
import { navigationComponent } from '../components/navigation.component';
import type { Product } from '../types/catalog';

export function searchProduct(term: string) {
  navigationComponent.goToProducts();
  cy.intercept({ method: 'GET', pathname: '/products', query: { search: term } }).as('searchRequest');
  catalogComponent.search(term);
  cy.wait('@searchRequest');
}

export function openProductDetails(product: Product) {
  navigationComponent.goToProductDetails(product.id);
}

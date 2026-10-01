import { cartComponent } from '../components/cart.component';
import { catalogComponent } from '../components/catalog.component';
import { navigationComponent } from '../components/navigation.component';
import type { CartLine, Product } from '../types/catalog';
import { openProductDetails } from './catalog.flow';

/** Adds a product with the given quantity from its detail page. Postcondition: the store confirms it. */
export function addToCart({ product, quantity }: CartLine) {
  openProductDetails(product);
  catalogComponent.setQuantity(quantity);
  cy.intercept({ method: 'GET', pathname: `/add_to_cart/${product.id}` }).as('addToCartRequest');
  catalogComponent.addToCart();
  cy.wait('@addToCartRequest');
  cartComponent.expectAddedConfirmation();
}

export function openCart() {
  navigationComponent.goToCart();
}

export function removeFromCart(product: Product) {
  cy.intercept({ method: 'GET', pathname: `/delete_cart/${product.id}` }).as('removeFromCartRequest');
  cartComponent.remove(product);
  cy.wait('@removeFromCartRequest');
}

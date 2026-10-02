import { cartAddedModalComponent } from '../components/cart-added-modal.component';
import { cartTableComponent } from '../components/cart-table.component';
import { productDetailComponent } from '../components/product-detail.component';
import type { CartLine, Product } from '../types/catalog';
import { openProductDetails } from './catalog.flow';
import { visitCart } from './navigation.flow';

/** Adds a product with the given quantity from its detail page. Postcondition: the store confirms it. */
export function addToCart({ product, quantity }: CartLine) {
  openProductDetails(product);
  productDetailComponent.setQuantity(quantity);
  cy.intercept({ method: 'GET', pathname: `/add_to_cart/${product.id}` }).as('addToCartRequest');
  productDetailComponent.addToCart();
  cy.wait('@addToCartRequest');
  cartAddedModalComponent.expectVisible();
}

export function openCart() {
  visitCart();
}

export function removeFromCart(product: Product) {
  cy.intercept({ method: 'GET', pathname: `/delete_cart/${product.id}` }).as('removeFromCartRequest');
  cartTableComponent.remove(product);
  cy.wait('@removeFromCartRequest');
}

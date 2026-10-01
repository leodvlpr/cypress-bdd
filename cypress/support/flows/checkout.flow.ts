import { cartComponent } from '../components/cart.component';
import { checkoutComponent } from '../components/checkout.component';
import type { PaymentCard } from '../types/checkout';
import { openCart } from './cart.flow';

/** Goes from the cart to the order review. Requires a signed-in user with products in the cart. */
export function proceedToCheckout() {
  openCart();
  cy.intercept({ method: 'GET', pathname: '/checkout' }).as('checkoutRequest');
  cartComponent.proceedToCheckout();
  cy.wait('@checkoutRequest');
}

export function payOrder(comment: string, card: PaymentCard) {
  checkoutComponent.addComment(comment);
  checkoutComponent.placeOrder();
  cy.intercept({ method: 'POST', pathname: '/payment' }).as('paymentRequest');
  checkoutComponent.fillCard(card);
  checkoutComponent.pay();
  cy.wait('@paymentRequest');
}

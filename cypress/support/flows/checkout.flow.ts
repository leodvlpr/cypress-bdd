import { cartTableComponent } from '../components/cart-table.component';
import { orderReviewComponent } from '../components/order-review.component';
import { paymentFormComponent } from '../components/payment-form.component';
import type { PaymentCard } from '../types/checkout';
import { openCart } from './cart.flow';

/** Goes from the cart to the order review. Requires a signed-in user with products in the cart. */
export function proceedToCheckout() {
  openCart();
  cy.intercept({ method: 'GET', pathname: '/checkout' }).as('checkoutRequest');
  cartTableComponent.proceedToCheckout();
  cy.wait('@checkoutRequest');
}

export function payOrder(comment: string, card: PaymentCard) {
  orderReviewComponent.addComment(comment);
  orderReviewComponent.placeOrder();
  cy.intercept({ method: 'POST', pathname: '/payment' }).as('paymentRequest');
  paymentFormComponent.fillCard(card);
  paymentFormComponent.pay();
  cy.wait('@paymentRequest');
}

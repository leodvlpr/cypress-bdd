import { css, id, qa, role, selector, text } from './selector';

// Only the wrapper has a data-qa (requested: delivery-address, order-comment, place-order).
export const orderReviewSelectors = {
  checkoutInfo: selector('orderReview.checkoutInfo', qa('checkout-info')),
  deliveryAddress: selector('orderReview.deliveryAddress', id('address_delivery')),
  orderComment: selector('orderReview.orderComment', css('textarea[name="message"]')),
  placeOrderButton: selector('orderReview.placeOrderButton', role('link', 'Place Order'), css('a[href="/payment"]'), text('Place Order', 'a')),
};

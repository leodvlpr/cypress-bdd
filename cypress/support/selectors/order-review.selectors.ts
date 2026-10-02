import { css, qa, selector, text } from './selector';

// Only the wrapper has a data-qa (requested: delivery-address, order-comment, place-order).
export const orderReviewSelectors = {
  checkoutInfo: selector('orderReview.checkoutInfo', qa('checkout-info')),
  deliveryAddress: selector('orderReview.deliveryAddress', css('#address_delivery')),
  orderComment: selector('orderReview.orderComment', css('textarea[name="message"]')),
  placeOrderButton: selector('orderReview.placeOrderButton', text('Place Order', 'a')),
};

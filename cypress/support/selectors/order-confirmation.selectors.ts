import { role, selector, testId, text } from './selector';

export const orderConfirmationSelectors = {
  heading: selector('orderConfirmation.heading', testId('order-placed'), role('heading', 'Order Placed!')),
  message: selector('orderConfirmation.message', text('Congratulations! Your order has been confirmed!')),
};

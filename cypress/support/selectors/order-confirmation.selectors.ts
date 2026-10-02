import { qa, selector, text } from './selector';

export const orderConfirmationSelectors = {
  heading: selector('orderConfirmation.heading', qa('order-placed')),
  message: selector('orderConfirmation.message', text('Congratulations! Your order has been confirmed!')),
};

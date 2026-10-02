import { qa, selector } from './selector';

export const paymentFormSelectors = {
  nameOnCardInput: selector('paymentForm.nameOnCardInput', qa('name-on-card')),
  cardNumberInput: selector('paymentForm.cardNumberInput', qa('card-number')),
  cvcInput: selector('paymentForm.cvcInput', qa('cvc')),
  expiryMonthInput: selector('paymentForm.expiryMonthInput', qa('expiry-month')),
  expiryYearInput: selector('paymentForm.expiryYearInput', qa('expiry-year')),
  payButton: selector('paymentForm.payButton', qa('pay-button')),
};

import { css, qa, role, selector } from './selector';

export const paymentFormSelectors = {
  nameOnCardInput: selector('paymentForm.nameOnCardInput', qa('name-on-card'), css('input[name="name_on_card"]')),
  cardNumberInput: selector('paymentForm.cardNumberInput', qa('card-number'), css('input[name="card_number"]')),
  cvcInput: selector('paymentForm.cvcInput', qa('cvc'), css('input[name="cvc"]')),
  expiryMonthInput: selector('paymentForm.expiryMonthInput', qa('expiry-month'), css('input[name="expiry_month"]')),
  expiryYearInput: selector('paymentForm.expiryYearInput', qa('expiry-year'), css('input[name="expiry_year"]')),
  payButton: selector('paymentForm.payButton', qa('pay-button'), role('button', 'Pay and Confirm Order')),
};

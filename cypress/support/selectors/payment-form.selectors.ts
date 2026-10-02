import { css, role, selector, testId } from './selector';

export const paymentFormSelectors = {
  nameOnCardInput: selector('paymentForm.nameOnCardInput', testId('name-on-card'), css('input[name="name_on_card"]')),
  cardNumberInput: selector('paymentForm.cardNumberInput', testId('card-number'), css('input[name="card_number"]')),
  cvcInput: selector('paymentForm.cvcInput', testId('cvc'), css('input[name="cvc"]')),
  expiryMonthInput: selector('paymentForm.expiryMonthInput', testId('expiry-month'), css('input[name="expiry_month"]')),
  expiryYearInput: selector('paymentForm.expiryYearInput', testId('expiry-year'), css('input[name="expiry_year"]')),
  payButton: selector('paymentForm.payButton', testId('pay-button'), role('button', 'Pay and Confirm Order')),
};

/** `data-qa` values for checkout and payment, used with `cy.getByQa()`. */
export const checkoutSelectors = {
  checkoutInfo: 'checkout-info',
  nameOnCardInput: 'name-on-card',
  cardNumberInput: 'card-number',
  cvcInput: 'cvc',
  expiryMonthInput: 'expiry-month',
  expiryYearInput: 'expiry-year',
  payButton: 'pay-button',
  orderPlacedHeading: 'order-placed',
} as const;

// No data-qa on these yet; id / form field name are the stable hooks (data-qa requested, see docs).
export const checkoutFallbackSelectors = {
  deliveryAddress: '#address_delivery',
  orderComment: 'textarea[name="message"]',
} as const;

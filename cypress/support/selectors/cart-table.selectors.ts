import { css, selector, text } from './selector';

// The cart has no data-qa yet (requested: cart-row, cart-quantity, cart-remove, proceed-to-checkout).
// Row-level selectors are meant to be resolved inside `row(...)`.
export const cartTableSelectors = {
  row: (productId: number) => selector('cartTable.row', css(`#product-${productId}`)),
  productName: (name: string) => selector('cartTable.productName', text(name)),
  // The quantity is rendered as a read-only button; its exact text is the value under test.
  quantity: (quantity: number) => selector('cartTable.quantity', text(new RegExp(`^\\s*${quantity}\\s*$`), 'button')),
  lineTotal: (total: number) => selector('cartTable.lineTotal', text(`Rs. ${total}`)),
  removeButton: (productId: number) => selector('cartTable.removeButton', css(`[data-product-id="${productId}"]`)),
  emptyMessage: selector('cartTable.emptyMessage', css('#empty_cart')),
  proceedToCheckoutButton: selector('cartTable.proceedToCheckoutButton', text('Proceed To Checkout', 'a')),
};

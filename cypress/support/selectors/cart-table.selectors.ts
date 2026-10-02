import { css, id, paramSelector, role, selector, text } from './selector';

// No data-qa in the cart yet (requested: cart-row, cart-quantity, cart-remove, proceed-to-checkout).
// Row-level selectors are meant to be resolved inside `row(...)`.
export const cartTableSelectors = {
  row: (productId: number) => paramSelector('cartTable.row', { productId }, id(`product-${productId}`)),
  productName: (name: string) => paramSelector('cartTable.productName', { name }, role('link', name), text(name)),
  // The quantity is rendered as a read-only button; its exact text is the value under test.
  quantity: (quantity: number) =>
    paramSelector('cartTable.quantity', { quantity }, role('button', String(quantity)), text(new RegExp(`^\\s*${quantity}\\s*$`), 'button')),
  lineTotal: (total: number) => paramSelector('cartTable.lineTotal', { total }, text(`Rs. ${total}`)),
  removeButton: (productId: number) => paramSelector('cartTable.removeButton', { productId }, css(`[data-product-id="${productId}"]`)),
  emptyMessage: selector('cartTable.emptyMessage', id('empty_cart')),
  // Rendered as an <a> without href (no link role), so its text is the only contract.
  proceedToCheckoutButton: selector('cartTable.proceedToCheckoutButton', text('Proceed To Checkout', 'a')),
};

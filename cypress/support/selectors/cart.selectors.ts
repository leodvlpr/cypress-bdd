// The cart has no data-qa yet; ids and data-product-id are the most stable hooks available (data-qa requested, see docs).
export const cartSelectors = {
  addedModal: '#cartModal',
  emptyCartMessage: '#empty_cart',
  row: (productId: number) => `#product-${productId}`,
  removeButton: (productId: number) => `[data-product-id="${productId}"]`,
} as const;

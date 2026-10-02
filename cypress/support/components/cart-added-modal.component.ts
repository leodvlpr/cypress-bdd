import { cartAddedModalSelectors } from '../selectors/cart-added-modal.selectors';

/** The "Added!" confirmation shown wherever a product is added to the cart. */
export const cartAddedModalComponent = {
  expectVisible() {
    return cy
      .getElement(cartAddedModalSelectors.modal)
      .should('be.visible')
      .and('contain.text', 'Your product has been added to cart.');
  },
};

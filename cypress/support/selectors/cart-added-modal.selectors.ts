import { css, selector } from './selector';

// No data-qa yet (requested: cart-added-modal).
export const cartAddedModalSelectors = {
  modal: selector('cartAddedModal.modal', css('#cartModal')),
};

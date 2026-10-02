import { id, selector } from './selector';

// No data-qa (requested: cart-added-modal) and no dialog role; the id is the only stable hook.
export const cartAddedModalSelectors = {
  modal: selector('cartAddedModal.modal', id('cartModal')),
};

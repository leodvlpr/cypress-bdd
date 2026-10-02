import { css, selector, text } from './selector';

// The product detail has no data-qa yet (requested: quantity, add-to-cart); its data is asserted by visible text.
export const productDetailSelectors = {
  name: (name: string) => selector('productDetail.name', text(name, 'h2')),
  category: (category: string) => selector('productDetail.category', text(`Category: ${category}`)),
  price: (price: number) => selector('productDetail.price', text(`Rs. ${price}`)),
  availability: (availability: string) => selector('productDetail.availability', text(`Availability: ${availability}`)),
  condition: (condition: string) => selector('productDetail.condition', text(`Condition: ${condition}`)),
  brand: (brand: string) => selector('productDetail.brand', text(`Brand: ${brand}`)),
  quantityInput: selector('productDetail.quantityInput', css('#quantity')),
  addToCartButton: selector('productDetail.addToCartButton', text('Add to cart', 'button')),
};

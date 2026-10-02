import { css, id, paramSelector, role, selector, text } from './selector';

// No data-qa on the product detail yet (requested: quantity, add-to-cart); its data is asserted by visible text.
export const productDetailSelectors = {
  name: (name: string) => paramSelector('productDetail.name', { name }, role('heading', name), text(name, 'h2')),
  category: (category: string) => paramSelector('productDetail.category', { category }, text(`Category: ${category}`)),
  price: (price: number) => paramSelector('productDetail.price', { price }, text(`Rs. ${price}`)),
  availability: (availability: string) => paramSelector('productDetail.availability', { availability }, text(`Availability: ${availability}`)),
  condition: (condition: string) => paramSelector('productDetail.condition', { condition }, text(`Condition: ${condition}`)),
  brand: (brand: string) => paramSelector('productDetail.brand', { brand }, text(`Brand: ${brand}`)),
  quantityInput: selector('productDetail.quantityInput', id('quantity'), css('input[name="quantity"]')),
  addToCartButton: selector('productDetail.addToCartButton', role('button', 'Add to cart'), text('Add to cart', 'button')),
};

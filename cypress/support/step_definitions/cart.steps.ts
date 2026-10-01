import { DataTable, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { cartComponent } from '../components/cart.component';
import { findProduct } from '../data/catalog';
import { addToCart, openCart, removeFromCart } from '../flows/cart.flow';
import type { CartLine } from '../types/catalog';

interface CartTableRow {
  product?: string;
  quantity?: string;
}

/** Converts a `| product | quantity |` table into typed cart lines, failing on invalid rows. */
function parseCartTable(table: DataTable): CartLine[] {
  return table.hashes().map((row: CartTableRow, index) => {
    const name = row.product?.trim();
    if (!name) {
      throw new Error(`Cart table row ${index + 1}: column "product" is required`);
    }
    const quantity = Number(row.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Cart table row ${index + 1}: "quantity" must be a positive integer, got "${row.quantity ?? ''}"`);
    }
    return { product: findProduct(name), quantity };
  });
}

Given('the customer has {int} unit(s) of {string} in the cart', (quantity: number, name: string) => {
  addToCart({ product: findProduct(name), quantity });
});

When('the customer adds to the cart:', (table: DataTable) => {
  parseCartTable(table).forEach(addToCart);
});

When('the customer removes {string} from the cart', (name: string) => {
  openCart();
  removeFromCart(findProduct(name));
});

Then('the cart contains:', (table: DataTable) => {
  openCart();
  parseCartTable(table).forEach((line) => cartComponent.expectLine(line));
});

Then('{string} is no longer in the cart', (name: string) => {
  cartComponent.expectProductAbsent(findProduct(name));
  cartComponent.expectEmpty();
});

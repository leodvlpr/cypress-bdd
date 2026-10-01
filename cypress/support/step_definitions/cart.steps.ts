import { DataTable, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import { cartComponent } from '../components/cart.component';
import { findProduct } from '../data/catalog';
import { addToCart, openCart, removeFromCart } from '../flows/cart.flow';
import type { CartLine } from '../types/catalog';

interface CartTableRow {
  producto?: string;
  cantidad?: string;
}

/** Converts a `| producto | cantidad |` table into typed cart lines, failing on invalid rows. */
function parseCartTable(table: DataTable): CartLine[] {
  return table.hashes().map((row: CartTableRow, index) => {
    const name = row.producto?.trim();
    if (!name) {
      throw new Error(`Cart table row ${index + 1}: column "producto" is required`);
    }
    const quantity = Number(row.cantidad);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Cart table row ${index + 1}: "cantidad" must be a positive integer, got "${row.cantidad ?? ''}"`);
    }
    return { product: findProduct(name), quantity };
  });
}

Given('tiene en el carrito {int} unidad(es) de {string}', (quantity: number, name: string) => {
  addToCart({ product: findProduct(name), quantity });
});

When('añade al carrito:', (table: DataTable) => {
  parseCartTable(table).forEach(addToCart);
});

When('elimina {string} del carrito', (name: string) => {
  openCart();
  removeFromCart(findProduct(name));
});

Then('el carrito contiene:', (table: DataTable) => {
  openCart();
  parseCartTable(table).forEach((line) => cartComponent.expectLine(line));
});

Then('{string} ya no está en el carrito', (name: string) => {
  cartComponent.expectProductAbsent(findProduct(name));
  cartComponent.expectEmpty();
});

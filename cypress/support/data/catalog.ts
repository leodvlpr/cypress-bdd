import products from '../../fixtures/products.json';
import type { Product } from '../types/catalog';

const catalog: readonly Product[] = products;

/** Resolves a product by the name used in Gherkin; fails listing the known products otherwise. */
export function findProduct(name: string): Product {
  const product = catalog.find((candidate) => candidate.name === name);
  if (!product) {
    throw new Error(`Unknown product "${name}". Known products: ${catalog.map((p) => p.name).join(', ')}`);
  }
  return product;
}

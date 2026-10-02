import { appConfig } from '../config';
import type { Product } from '../types/catalog';

/** Resolves a product by the name used in Gherkin (catalog from CATALOG_FIXTURE); fails listing the known ones. */
export function findProduct(name: string): Product {
  const catalog = appConfig().catalog;
  const product = catalog.find((candidate) => candidate.name === name);
  if (!product) {
    throw new Error(`Unknown product "${name}". Known products: ${catalog.map((p) => p.name).join(', ')}`);
  }
  return product;
}

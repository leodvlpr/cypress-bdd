import type { SelectorParams } from './selector';

/** One line of cypress/.drift/drift-log.ndjson: an element found by a non-primary strategy. */
export interface DriftEvent {
  /** Logical selector name, e.g. `cartTable.row`; stable for grouping. */
  name: string;
  /** Arguments of a parameterized definition, e.g. `{ productId: 1 }`; absent for plain definitions. */
  params?: SelectorParams;
  /** Readable id of the exact instance, e.g. `cartTable.row(productId=1)`. */
  label: string;
  /** The `.within()` scope it was resolved in, e.g. `#product-2` for a cart row; absent at page level. */
  scope?: string;
  strategyUsed: string;
  strategyIndex: number;
  primaryStrategy: string;
  timestamp: string;
  specPath: string;
  test: string;
  /** Set for demo definitions; routes the event to the demo drift log. */
  demo?: true;
}

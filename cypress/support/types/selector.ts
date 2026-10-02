/** How an element can be located, from most to least preferred. */
export type SelectorStrategy =
  /** `data-qa` attribute: the agreed test-id contract with development. */
  | { by: 'qa'; value: string }
  /** App-owned id, data-* or form field name, used while a data-qa is missing. */
  | { by: 'css'; value: string }
  /** Accessible name or visible text, only when that text is the contract under test. */
  | { by: 'text'; value: string | RegExp; tag?: string };

/**
 * A UI element the suite interacts with. `name` is the stable logical id (e.g. `cartTable.row`)
 * that resolution logs refer to; `strategies` is ordered by preference.
 */
export interface SelectorDefinition {
  name: string;
  strategies: readonly [SelectorStrategy, ...SelectorStrategy[]];
}

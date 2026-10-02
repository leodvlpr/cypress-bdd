/** How an element can be located. A definition lists them from most to least preferred. */
export type SelectorStrategy =
  /** Test-id attribute agreed with development; the attribute name comes from TEST_ID_ATTRIBUTE. */
  | { type: 'test-id'; value: string }
  /** App-owned element id. */
  | { type: 'id'; value: string }
  /** Other app-owned attribute (data-*, form field name, href), used while a test id is missing. */
  | { type: 'css'; value: string }
  /** ARIA role + accessible name, for elements with a real role (buttons, links, headings…). */
  | { type: 'role'; value: { role: AriaRole; name: string } }
  /** Visible text, only when that text is the contract under test. */
  | { type: 'text'; value: string | RegExp; tag?: string };

export type AriaRole = 'button' | 'link' | 'heading' | 'img' | 'radio';

/**
 * A UI element the suite interacts with. `name` is the stable logical id (e.g. `cartTable.row`)
 * reported in drift logs; `strategies` are tried in order and the first match wins.
 * Definitions built by a factory carry their arguments in `params`.
 */
export interface SelectorDefinition {
  name: string;
  /** Arguments of a parameterized definition (e.g. `{ productId: 1 }` for `cartTable.row`), so logs tell instances apart. */
  params?: Readonly<SelectorParams>;
  /** Demo-only definition: its drift goes to the isolated demo log (see `demoSelector`). */
  demo?: true;
  strategies: readonly [SelectorStrategy, ...SelectorStrategy[]];
}

export type SelectorParams = Record<string, string | number>;

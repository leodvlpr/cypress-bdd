import type { AriaRole, SelectorDefinition, SelectorParams, SelectorStrategy } from '../types/selector';

/** Test-id strategy; resolved against the configured TEST_ID_ATTRIBUTE (e.g. `data-qa`, `data-testid`). */
export const testId = (value: string): SelectorStrategy => ({ type: 'test-id', value });
export const id = (value: string): SelectorStrategy => ({ type: 'id', value });
export const css = (value: string): SelectorStrategy => ({ type: 'css', value });
export const role = (ariaRole: AriaRole, name: string): SelectorStrategy => ({ type: 'role', value: { role: ariaRole, name } });
export const text = (value: string | RegExp, tag?: string): SelectorStrategy => ({ type: 'text', value, tag });

export function selector(name: string, ...strategies: [SelectorStrategy, ...SelectorStrategy[]]): SelectorDefinition {
  return { name, strategies };
}

/** For factory definitions: records the arguments so each instance is identifiable in logs. */
export function paramSelector(
  name: string,
  params: SelectorParams,
  ...strategies: [SelectorStrategy, ...SelectorStrategy[]]
): SelectorDefinition {
  return { name, params, strategies };
}

/**
 * Marks a definition as demo-only: its drift events go to the separate demo log, never the real one.
 * Only for scenarios tagged @demo.
 */
export function demoSelector(definition: SelectorDefinition): SelectorDefinition {
  return { ...definition, demo: true };
}

/** Readable id for logs and errors, e.g. `cartTable.row(productId=1)`. */
export function describeDefinition({ name, params }: SelectorDefinition): string {
  if (!params) return name;
  const args = Object.entries(params).map(([key, value]) => `${key}=${typeof value === 'string' ? JSON.stringify(value) : value}`);
  return `${name}(${args.join(', ')})`;
}

export function describeStrategy(strategy: SelectorStrategy): string {
  switch (strategy.type) {
    case 'role':
      return `role(${strategy.value.role}, "${strategy.value.name}")`;
    case 'text':
      return `text(${String(strategy.value)}${strategy.tag ? `, ${strategy.tag}` : ''})`;
    case 'test-id':
      return `testId(${strategy.value})`;
    default:
      return `${strategy.type}(${strategy.value})`;
  }
}

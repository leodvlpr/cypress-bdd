import type { SelectorDefinition, SelectorStrategy } from '../types/selector';

export const qa = (value: string): SelectorStrategy => ({ by: 'qa', value });
export const css = (value: string): SelectorStrategy => ({ by: 'css', value });
export const text = (value: string | RegExp, tag?: string): SelectorStrategy => ({ by: 'text', value, tag });

export function selector(name: string, ...strategies: [SelectorStrategy, ...SelectorStrategy[]]): SelectorDefinition {
  return { name, strategies };
}

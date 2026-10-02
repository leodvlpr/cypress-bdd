import { describeStrategy } from '../selectors/selector';
import type { DriftEvent } from '../types/drift';
import type { SelectorDefinition } from '../types/selector';

/** Asserts the log at `logPath` holds a drift event for `definition`, resolved by its strategy at `strategyIndex`. */
export function expectDriftRecorded(logPath: string, definition: SelectorDefinition, strategyIndex: number) {
  cy.readFile(logPath).should((content: string) => {
    const events: DriftEvent[] = content
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as DriftEvent);
    const event = events.find((candidate) => candidate.name === definition.name);
    expect(event, `drift event for ${definition.name}`).to.exist;
    expect(event?.strategyIndex).to.eq(strategyIndex);
    expect(event?.primaryStrategy).to.eq(describeStrategy(definition.strategies[0]));
    expect(event?.strategyUsed).to.eq(describeStrategy(definition.strategies[strategyIndex]));
    expect(event?.demo).to.eq(definition.demo);
  });
}

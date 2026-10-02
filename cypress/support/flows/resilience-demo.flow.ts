import { DEMO_DRIFT_LOG } from '../drift';
import { resilienceDemoSelectors } from '../selectors/resilience-demo.selectors';
import { expectDriftRecorded } from './drift.flow';

/** The degraded logo must have been resolved by its fallback (index 1) and logged to the demo log. */
export function expectDegradedLogoDriftInDemoLog() {
  expectDriftRecorded(DEMO_DRIFT_LOG, resilienceDemoSelectors.degradedLogo, 1);
}

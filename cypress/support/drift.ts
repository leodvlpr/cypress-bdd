// Paths relative to the project root, shared by the logDrift task and specs that read the logs.
export const DRIFT_LOG = 'cypress/.drift/drift-log.ndjson';
/** Isolated log for @demo scenarios, so deliberate degradation never pollutes the real drift signal. */
export const DEMO_DRIFT_LOG = 'cypress/.drift/demo-drift-log.ndjson';

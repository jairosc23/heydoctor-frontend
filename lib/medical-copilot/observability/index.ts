/**
 * CB-2 — Clinical Observability public surface.
 */

export type {
  ClinicalTelemetryDetail,
  ClinicalTelemetryEventName,
  ClinicalTelemetrySink,
  ClinicalWorkflowMetricsSnapshot,
} from "./types";

export { CLINICAL_OBSERVABILITY_VERSION } from "./types";

export {
  assertPhiSafeDetail,
  buildSafeDetail,
  truncateRef,
} from "./phi-safe";

export {
  emitClinicalTelemetry,
  registerClinicalTelemetrySink,
  setClinicalTelemetryRemoteSinkEnabled,
} from "./emit";

export {
  createClinicalWorkflowMetricsStore,
  type ClinicalWorkflowMetricsStore,
} from "./metrics";

export {
  observeClinicalWorkflowTransition,
  type ObservedTelemetryEmission,
} from "./workflow-observer";

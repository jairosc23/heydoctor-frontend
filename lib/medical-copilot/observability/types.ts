/**
 * CB-2 — Clinical Observability event & metrics contracts (PHI-safe).
 */

export const CLINICAL_OBSERVABILITY_VERSION = "v1" as const;

export type ClinicalTelemetryEventName =
  | "consultation_opened"
  | "workflow_started"
  | "workflow_completed"
  | "workflow_cancelled"
  | "dictation_started"
  | "dictation_finalized"
  | "governed_analysis_requested"
  | "governed_analysis_completed"
  | "timeout"
  | "restart_preserve_session"
  | "recoverable_error"
  | "non_recoverable_error";

/** Allowlisted technical fields only — never PHI / clinical content. */
export type ClinicalTelemetryDetail = {
  observabilityVersion: typeof CLINICAL_OBSERVABILITY_VERSION;
  phase?: string;
  status?: string;
  /** Truncated technical ref (never full patient identifiers). */
  consultationRef?: string;
  /** Truncated copilot session ref. */
  sessionRef?: string;
  hasSession?: boolean;
  dictationActive?: boolean;
  governedAnalysisStatus?: string;
  errorCode?: string;
  recoverable?: boolean;
  preserveSession?: boolean;
  heuristicSuggestionCount?: number;
  governedSuggestionCount?: number;
  progressPercent?: number;
  durationMs?: number;
  restartCount?: number;
  errorCount?: number;
  governedRequestCount?: number;
};

export type ClinicalWorkflowMetricsSnapshot = {
  workflowStartedCount: number;
  workflowCompletedCount: number;
  workflowCancelledCount: number;
  restartCount: number;
  errorCount: number;
  recoverableErrorCount: number;
  nonRecoverableErrorCount: number;
  governedRequestCount: number;
  governedCompletedCount: number;
  timeoutCount: number;
  dictationStartCount: number;
  /** Accumulated dictation listening time (ms). */
  dictationDurationMs: number;
  /** Wall time from workflow start → first governed request (ms), if any. */
  timeToFirstGovernedAnalysisMs: number | null;
  /** Wall time from workflow start → completed (ms), last completed run. */
  lastWorkflowDurationMs: number | null;
  /** completed / started (0–1). */
  completionRate: number;
};

export type ClinicalTelemetrySink = (
  event: ClinicalTelemetryEventName,
  detail: ClinicalTelemetryDetail,
) => void;

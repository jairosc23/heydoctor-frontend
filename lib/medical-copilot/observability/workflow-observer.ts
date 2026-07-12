/**
 * CB-2 — Non-invasive Clinical Workflow telemetry observer.
 * Diffs WorkflowState transitions — does not modify the Coordinator.
 */

import type { WorkflowState } from "../workflow/types";
import { emitClinicalTelemetry } from "./emit";
import type { ClinicalWorkflowMetricsStore } from "./metrics";
import { truncateRef } from "./phi-safe";
import type { ClinicalTelemetryEventName } from "./types";

export type ObservedTelemetryEmission = {
  event: ClinicalTelemetryEventName;
  detail: ReturnType<typeof emitClinicalTelemetry>;
};

function baseDetail(state: WorkflowState) {
  return {
    phase: state.phase,
    status: state.status,
    consultationRef: truncateRef(state.consultationId),
    sessionRef: truncateRef(state.sessionId),
    hasSession: Boolean(state.sessionId),
    dictationActive: state.dictationActive,
    governedAnalysisStatus: state.governedAnalysisStatus,
    heuristicSuggestionCount: state.heuristicSuggestionCount,
    governedSuggestionCount: state.governedSuggestionCount,
    progressPercent: state.progress.percent,
  };
}

function durationFromStart(state: WorkflowState, atMs = Date.now()): number | null {
  if (!state.startedAt) return null;
  const start = Date.parse(state.startedAt);
  if (Number.isNaN(start)) return null;
  return Math.max(0, atMs - start);
}

/**
 * Observe a state transition and emit PHI-safe telemetry + update metrics.
 */
export function observeClinicalWorkflowTransition(
  prev: WorkflowState | null,
  next: WorkflowState,
  metrics: ClinicalWorkflowMetricsStore,
  opts?: {
    emit?: typeof emitClinicalTelemetry;
    nowMs?: number;
    /** Internal clock for dictation segment timing. */
    dictationStartedAtMs?: number | null;
  },
): {
  emissions: ObservedTelemetryEmission[];
  nextDictationStartedAtMs: number | null;
} {
  const emit = opts?.emit ?? emitClinicalTelemetry;
  const nowMs = opts?.nowMs ?? Date.now();
  let dictationStartedAtMs = opts?.dictationStartedAtMs ?? null;
  const emissions: ObservedTelemetryEmission[] = [];

  const push = (
    event: ClinicalTelemetryEventName,
    extra: Parameters<typeof emitClinicalTelemetry>[1] = {},
  ) => {
    const detail = emit(event, { ...baseDetail(next), ...extra });
    emissions.push({ event, detail });
  };

  // Consultation opened / workflow started
  if (
    (!prev || prev.consultationId !== next.consultationId || prev.phase === "idle") &&
    next.phase === "entering_consultation"
  ) {
    push("consultation_opened");
    push("workflow_started");
    metrics.markWorkflowStarted();
  }

  // Dictation start / finalize
  if (prev && !prev.dictationActive && next.dictationActive) {
    push("dictation_started");
    metrics.markDictationStarted();
    dictationStartedAtMs = nowMs;
  }
  if (prev && prev.dictationActive && !next.dictationActive) {
    const segment =
      dictationStartedAtMs != null ? Math.max(0, nowMs - dictationStartedAtMs) : 0;
    metrics.addDictationDuration(segment);
    push("dictation_finalized", { durationMs: segment });
    dictationStartedAtMs = null;
  }

  // Governed analysis requested
  if (
    prev &&
    prev.governedAnalysisStatus !== "loading" &&
    next.governedAnalysisStatus === "loading"
  ) {
    const ttf = durationFromStart(next, nowMs);
    metrics.markGovernedRequested(ttf);
    push("governed_analysis_requested", {
      durationMs: ttf ?? undefined,
    });
  }

  // Governed completed
  if (
    prev &&
    prev.governedAnalysisStatus === "loading" &&
    next.governedAnalysisStatus === "success"
  ) {
    metrics.markGovernedCompleted();
    push("governed_analysis_completed");
  }

  // Timeout
  if (
    prev &&
    prev.governedAnalysisStatus !== "timeout" &&
    next.governedAnalysisStatus === "timeout"
  ) {
    metrics.markTimeout();
    push("timeout", { errorCode: next.error?.code });
  }

  // Recoverable / non-recoverable errors
  if (prev && prev.phase !== "recoverable_error" && next.phase === "recoverable_error") {
    const recoverable = next.error?.recoverable === true;
    if (recoverable) {
      metrics.markRecoverableError();
      push("recoverable_error", {
        errorCode: next.error?.code,
        recoverable: true,
      });
    } else {
      metrics.markNonRecoverableError();
      push("non_recoverable_error", {
        errorCode: next.error?.code,
        recoverable: false,
      });
    }
  }

  // Restart preserveSession: same locked session, back to workspace_ready
  // with governed reset (do not rely solely on startedAt — same-ms collisions).
  if (
    prev &&
    prev.sessionId &&
    next.sessionId === prev.sessionId &&
    next.phase === "workspace_ready" &&
    next.governedAnalysisStatus === "idle" &&
    (prev.phase === "recoverable_error" ||
      prev.phase === "hitl_review" ||
      prev.phase === "governed_analysis" ||
      prev.phase === "consultation_complete" ||
      (prev.startedAt !== next.startedAt &&
        prev.phase !== "entering_consultation" &&
        prev.phase !== "bootstrapping" &&
        prev.phase !== "workspace_ready"))
  ) {
    metrics.markRestart();
    push("restart_preserve_session", { preserveSession: true });
  }

  // Workflow cancelled: restart without session
  if (
    prev &&
    prev.sessionId &&
    !next.sessionId &&
    next.phase === "entering_consultation" &&
    prev.startedAt !== next.startedAt
  ) {
    metrics.markWorkflowCancelled();
    push("workflow_cancelled", { preserveSession: false });
  }

  // Workflow completed
  if (
    prev &&
    prev.phase !== "consultation_complete" &&
    next.phase === "consultation_complete"
  ) {
    const duration = durationFromStart(next, nowMs) ?? 0;
    metrics.markWorkflowCompleted(duration);
    push("workflow_completed", {
      durationMs: duration,
      restartCount: metrics.snapshot().restartCount,
      errorCount: metrics.snapshot().errorCount,
      governedRequestCount: metrics.snapshot().governedRequestCount,
    });
  }

  return { emissions, nextDictationStartedAtMs: dictationStartedAtMs };
}

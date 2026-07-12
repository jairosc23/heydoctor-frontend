/**
 * CB-2 — In-memory clinical workflow metrics (aggregated, PHI-safe).
 */

import type { ClinicalWorkflowMetricsSnapshot } from "./types";

export type ClinicalWorkflowMetricsStore = {
  snapshot: () => ClinicalWorkflowMetricsSnapshot;
  markWorkflowStarted: () => void;
  markWorkflowCompleted: (durationMs: number) => void;
  markWorkflowCancelled: () => void;
  markRestart: () => void;
  markRecoverableError: () => void;
  markNonRecoverableError: () => void;
  markGovernedRequested: (timeToFirstMs: number | null) => void;
  markGovernedCompleted: () => void;
  markTimeout: () => void;
  markDictationStarted: () => void;
  addDictationDuration: (ms: number) => void;
  reset: () => void;
};

function empty(): ClinicalWorkflowMetricsSnapshot {
  return {
    workflowStartedCount: 0,
    workflowCompletedCount: 0,
    workflowCancelledCount: 0,
    restartCount: 0,
    errorCount: 0,
    recoverableErrorCount: 0,
    nonRecoverableErrorCount: 0,
    governedRequestCount: 0,
    governedCompletedCount: 0,
    timeoutCount: 0,
    dictationStartCount: 0,
    dictationDurationMs: 0,
    timeToFirstGovernedAnalysisMs: null,
    lastWorkflowDurationMs: null,
    completionRate: 0,
  };
}

function withRate(
  s: ClinicalWorkflowMetricsSnapshot,
): ClinicalWorkflowMetricsSnapshot {
  return {
    ...s,
    completionRate:
      s.workflowStartedCount > 0
        ? s.workflowCompletedCount / s.workflowStartedCount
        : 0,
  };
}

export function createClinicalWorkflowMetricsStore(
  initial?: Partial<ClinicalWorkflowMetricsSnapshot>,
): ClinicalWorkflowMetricsStore {
  let state: ClinicalWorkflowMetricsSnapshot = {
    ...empty(),
    ...initial,
  };

  return {
    snapshot: () => withRate({ ...state }),
    reset: () => {
      state = empty();
    },
    markWorkflowStarted: () => {
      state = withRate({
        ...state,
        workflowStartedCount: state.workflowStartedCount + 1,
      });
    },
    markWorkflowCompleted: (durationMs) => {
      state = withRate({
        ...state,
        workflowCompletedCount: state.workflowCompletedCount + 1,
        lastWorkflowDurationMs: durationMs,
      });
    },
    markWorkflowCancelled: () => {
      state = withRate({
        ...state,
        workflowCancelledCount: state.workflowCancelledCount + 1,
      });
    },
    markRestart: () => {
      state = withRate({
        ...state,
        restartCount: state.restartCount + 1,
      });
    },
    markRecoverableError: () => {
      state = withRate({
        ...state,
        errorCount: state.errorCount + 1,
        recoverableErrorCount: state.recoverableErrorCount + 1,
      });
    },
    markNonRecoverableError: () => {
      state = withRate({
        ...state,
        errorCount: state.errorCount + 1,
        nonRecoverableErrorCount: state.nonRecoverableErrorCount + 1,
      });
    },
    markGovernedRequested: (timeToFirstMs) => {
      state = withRate({
        ...state,
        governedRequestCount: state.governedRequestCount + 1,
        timeToFirstGovernedAnalysisMs:
          state.timeToFirstGovernedAnalysisMs ?? timeToFirstMs,
      });
    },
    markGovernedCompleted: () => {
      state = withRate({
        ...state,
        governedCompletedCount: state.governedCompletedCount + 1,
      });
    },
    markTimeout: () => {
      state = withRate({
        ...state,
        timeoutCount: state.timeoutCount + 1,
      });
    },
    markDictationStarted: () => {
      state = withRate({
        ...state,
        dictationStartCount: state.dictationStartCount + 1,
      });
    },
    addDictationDuration: (ms) => {
      if (ms <= 0) return;
      state = withRate({
        ...state,
        dictationDurationMs: state.dictationDurationMs + ms,
      });
    },
  };
}

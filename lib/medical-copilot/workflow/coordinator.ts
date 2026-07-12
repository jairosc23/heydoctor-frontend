/**
 * CB-1 — ClinicalWorkflowCoordinator (pure state machine).
 * Orchestrates existing Copilot surfaces — does not execute Skills/SOAP/EMR.
 */

import { buildWorkflowProgress } from "./progress";
import {
  CLINICAL_WORKFLOW_GOVERNANCE,
  CLINICAL_WORKFLOW_VERSION,
  INITIAL_WORKFLOW_STATE,
  type WorkflowEvent,
  type WorkflowState,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function withMeta(
  state: WorkflowState,
  patch: Partial<WorkflowState>,
): WorkflowState {
  const next: WorkflowState = {
    ...state,
    ...patch,
    version: CLINICAL_WORKFLOW_VERSION,
    governance: { ...CLINICAL_WORKFLOW_GOVERNANCE },
    updatedAt: nowIso(),
  };
  next.progress = buildWorkflowProgress(next.phase, {
    error: next.phase === "recoverable_error",
  });
  return next;
}

export function reduceClinicalWorkflow(
  state: WorkflowState,
  event: WorkflowEvent,
): WorkflowState {
  switch (event.type) {
    case "CONSULTATION_OPENED":
      return withMeta(state, {
        phase: "entering_consultation",
        status: "running",
        consultationId: event.consultationId,
        patientId: event.patientId,
        sessionId: null,
        dictationActive: false,
        heuristicSuggestionCount: 0,
        governedSuggestionCount: 0,
        governedAnalysisStatus: "idle",
        error: null,
        startedAt: nowIso(),
        endedAt: null,
      });

    case "BOOTSTRAP_STARTED":
      if (state.phase === "consultation_complete") return state;
      return withMeta(state, {
        phase: "bootstrapping",
        status: "running",
        error: null,
      });

    case "SESSION_READY": {
      // Lock session for the consultation; ignore conflicting ids.
      const sessionId = state.sessionId ?? event.sessionId;
      let phase = state.phase;
      if (
        phase === "entering_consultation" ||
        phase === "bootstrapping" ||
        phase === "recoverable_error" ||
        phase === "idle"
      ) {
        phase = "workspace_ready";
      }
      return withMeta(state, {
        phase,
        status: "running",
        sessionId,
        error: null,
      });
    }

    case "BOOTSTRAP_FAILED":
      return withMeta(state, {
        phase: "recoverable_error",
        status: "error",
        error: {
          code: "bootstrap_failed",
          message: event.message,
          recoverable: true,
          atPhase: state.phase,
        },
      });

    case "DICTATION_ACTIVE":
      return withMeta(state, {
        dictationActive: event.active,
        status: state.status === "idle" ? "running" : state.status,
      });

    case "DICTATION_READY": {
      if (!state.sessionId) {
        return state;
      }
      if (state.phase === "workspace_ready") {
        return withMeta(state, { phase: "dictation_ready" });
      }
      return state;
    }

    case "VOICE_INTEL_UPDATED": {
      let phase = state.phase;
      if (
        state.sessionId &&
        (phase === "workspace_ready" || phase === "dictation_ready")
      ) {
        phase = "voice_intelligence_active";
      }
      return withMeta(state, {
        heuristicSuggestionCount: event.suggestionCount,
        phase,
      });
    }

    case "GOVERNED_ANALYSIS_STARTED":
      return withMeta(state, {
        phase: "governed_analysis",
        status: "running",
        governedAnalysisStatus: "loading",
        error: null,
      });

    case "GOVERNED_ANALYSIS_FINISHED": {
      if (!event.ok) {
        return withMeta(state, {
          phase: "recoverable_error",
          status: "error",
          governedAnalysisStatus: event.timedOut ? "timeout" : "error",
          governedSuggestionCount: 0,
          error: {
            code: event.timedOut ? "governed_timeout" : "governed_failed",
            message: event.message ?? "Falló el análisis gobernado",
            recoverable: true,
            atPhase: "governed_analysis",
          },
        });
      }
      return withMeta(state, {
        phase: "hitl_review",
        status: "awaiting_physician",
        governedAnalysisStatus: "success",
        governedSuggestionCount: event.suggestionCount,
        error: null,
      });
    }

    case "ENTER_HITL_REVIEW":
      return withMeta(state, {
        phase: "hitl_review",
        status: "awaiting_physician",
      });

    case "CONSULTATION_ENDED":
      return withMeta(state, {
        phase: "consultation_complete",
        status: "completed",
        endedAt: nowIso(),
        error: null,
      });

    case "RESTART": {
      const preservedSession = event.preserveSession ? state.sessionId : null;
      return withMeta(state, {
        phase: preservedSession ? "workspace_ready" : "entering_consultation",
        status: "running",
        sessionId: preservedSession,
        dictationActive: false,
        heuristicSuggestionCount: 0,
        governedSuggestionCount: 0,
        governedAnalysisStatus: "idle",
        error: null,
        endedAt: null,
        startedAt: nowIso(),
      });
    }

    case "CLEAR_ERROR":
      if (state.phase !== "recoverable_error") return state;
      return withMeta(state, {
        phase: state.sessionId ? "workspace_ready" : "entering_consultation",
        status: "running",
        error: null,
      });

    default:
      return state;
  }
}

export type ClinicalWorkflowCoordinator = {
  getState: () => WorkflowState;
  dispatch: (event: WorkflowEvent) => WorkflowState;
  subscribe: (listener: (state: WorkflowState) => void) => () => void;
  /** Locked session id for the consultation, if any. */
  getSessionId: () => string | null;
};

export function createClinicalWorkflowCoordinator(
  initial: WorkflowState = INITIAL_WORKFLOW_STATE,
): ClinicalWorkflowCoordinator {
  let state = initial;
  const listeners = new Set<(s: WorkflowState) => void>();

  return {
    getState: () => state,
    getSessionId: () => state.sessionId,
    dispatch: (event) => {
      state = reduceClinicalWorkflow(state, event);
      listeners.forEach((l) => l(state));
      return state;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

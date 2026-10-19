"use client";

/**
 * CB-1 — ClinicalWorkflowProvider.
 * Observes existing Copilot providers and drives the workflow state machine.
 * Does not modify Store/Workspace/Adapter internals.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useClinicalDictation,
  useDictationBuffer,
} from "@/context/ClinicalDictationContext";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
import { useClinicalVoiceIntelligence } from "@/context/ClinicalVoiceIntelligenceContext";
import {
  buildGovernedAnalysisRequest,
  mapGovernedAnalysisToSuggestions,
  useClinicalIntelligenceAnalysis,
} from "@/lib/medical-copilot/clinical-intelligence";
import {
  createClinicalWorkflowCoordinator,
  type ClinicalWorkflowCoordinator,
  type WorkflowState,
} from "@/lib/medical-copilot/workflow";

export type ClinicalWorkflowContextValue = {
  state: WorkflowState;
  phase: WorkflowState["phase"];
  status: WorkflowState["status"];
  progress: WorkflowState["progress"];
  sessionId: string | null;
  consultationId: string;
  patientId: string;
  error: WorkflowState["error"];
  governance: WorkflowState["governance"];
  /** HITL governed analysis via Adapter — reuses locked sessionId. */
  requestGovernedAnalysis: () => Promise<void>;
  clearGovernedAnalysis: () => void;
  governedLoading: boolean;
  governedError: string | null;
  governedData: ReturnType<
    typeof useClinicalIntelligenceAnalysis
  >["data"];
  governedSuggestions: ReturnType<
    typeof mapGovernedAnalysisToSuggestions
  >;
  governedHookStatus: ReturnType<
    typeof useClinicalIntelligenceAnalysis
  >["status"];
  restart: (opts?: { preserveSession?: boolean }) => Promise<void>;
  endConsultation: () => void;
  clearError: () => void;
  coordinator: ClinicalWorkflowCoordinator;
};

const ClinicalWorkflowContext =
  createContext<ClinicalWorkflowContextValue | null>(null);

export type ClinicalWorkflowProviderProps = {
  children: ReactNode;
  consultationId: string;
  patientId: string;
  /** Injected coordinator for tests. */
  coordinator?: ClinicalWorkflowCoordinator;
};

export function ClinicalWorkflowProvider({
  children,
  consultationId,
  patientId,
  coordinator: injected,
}: ClinicalWorkflowProviderProps) {
  const coordinatorRef = useRef(
    injected ?? createClinicalWorkflowCoordinator(),
  );
  const coordinator = coordinatorRef.current;

  const [state, setState] = useState<WorkflowState>(() =>
    coordinator.getState(),
  );

  const {
    session,
    loading: bootstrapLoading,
    error: bootstrapError,
    hasError,
    refresh,
  } = useMedicalCopilot();
  const { status: dictationStatus } = useClinicalDictation();
  const buffer = useDictationBuffer();
  const { suggestions: heuristicSuggestions } = useClinicalVoiceIntelligence();
  const {
    analyze,
    reset: resetGoverned,
    isLoading: governedLoading,
    error: governedAnalysisError,
    status: analysisHookStatus,
    data: governedData,
  } = useClinicalIntelligenceAnalysis();

  const governedSuggestions = useMemo(
    () => (governedData ? mapGovernedAnalysisToSuggestions(governedData) : []),
    [governedData],
  );

  useEffect(() => coordinator.subscribe(setState), [coordinator]);

  useEffect(() => {
    coordinator.dispatch({
      type: "CONSULTATION_OPENED",
      consultationId,
      patientId,
    });
  }, [coordinator, consultationId, patientId]);

  useEffect(() => {
    if (bootstrapLoading) {
      coordinator.dispatch({ type: "BOOTSTRAP_STARTED" });
    }
  }, [bootstrapLoading, coordinator]);

  useEffect(() => {
    if (session?.sessionId) {
      coordinator.dispatch({
        type: "SESSION_READY",
        sessionId: session.sessionId,
      });
    }
  }, [coordinator, session?.sessionId]);

  useEffect(() => {
    if (hasError && bootstrapError && !session?.sessionId) {
      coordinator.dispatch({
        type: "BOOTSTRAP_FAILED",
        message: bootstrapError,
      });
    }
  }, [bootstrapError, coordinator, hasError, session?.sessionId]);

  useEffect(() => {
    const active =
      dictationStatus === "listening" || dictationStatus === "starting";
    coordinator.dispatch({ type: "DICTATION_ACTIVE", active });
  }, [coordinator, dictationStatus]);

  useEffect(() => {
    if (session?.sessionId && buffer.draft.trim().length > 0) {
      coordinator.dispatch({ type: "DICTATION_READY" });
    }
  }, [buffer.draft, coordinator, session?.sessionId]);

  useEffect(() => {
    coordinator.dispatch({
      type: "VOICE_INTEL_UPDATED",
      suggestionCount: heuristicSuggestions.length,
    });
  }, [coordinator, heuristicSuggestions.length]);

  const requestGovernedAnalysis = useCallback(async () => {
    const lockedSessionId =
      coordinator.getSessionId() ?? session?.sessionId ?? undefined;
    coordinator.dispatch({ type: "GOVERNED_ANALYSIS_STARTED" });
    const request = buildGovernedAnalysisRequest({
      consultationId,
      patientId,
      sessionId: lockedSessionId,
      dictationDraft: buffer.draft,
    });
    const result = await analyze(request);
    if (result) {
      const suggestions = mapGovernedAnalysisToSuggestions(result);
      coordinator.dispatch({
        type: "GOVERNED_ANALYSIS_FINISHED",
        ok: true,
        suggestionCount: suggestions.length,
      });
      return;
    }
    coordinator.dispatch({
      type: "GOVERNED_ANALYSIS_FINISHED",
      ok: false,
      suggestionCount: 0,
      message: "Falló el análisis gobernado",
      timedOut: analysisHookStatus === "timeout",
    });
  }, [
    analysisHookStatus,
    analyze,
    buffer.draft,
    consultationId,
    coordinator,
    patientId,
    session?.sessionId,
  ]);

  const clearGovernedAnalysis = useCallback(() => {
    resetGoverned();
  }, [resetGoverned]);

  const restart = useCallback(
    async (opts?: { preserveSession?: boolean }) => {
      const preserveSession = opts?.preserveSession !== false;
      resetGoverned();
      coordinator.dispatch({ type: "RESTART", preserveSession });
      if (preserveSession && coordinator.getSessionId()) {
        await refresh();
      }
    },
    [coordinator, refresh, resetGoverned],
  );

  const endConsultation = useCallback(() => {
    coordinator.dispatch({ type: "CONSULTATION_ENDED" });
  }, [coordinator]);

  const clearError = useCallback(() => {
    coordinator.dispatch({ type: "CLEAR_ERROR" });
  }, [coordinator]);

  const value = useMemo<ClinicalWorkflowContextValue>(
    () => ({
      state,
      phase: state.phase,
      status: state.status,
      progress: state.progress,
      sessionId: state.sessionId,
      consultationId,
      patientId,
      error: state.error,
      governance: state.governance,
      requestGovernedAnalysis,
      clearGovernedAnalysis,
      governedLoading,
      governedError:
        governedAnalysisError?.message ?? state.error?.message ?? null,
      governedData,
      governedSuggestions,
      governedHookStatus: analysisHookStatus,
      restart,
      endConsultation,
      clearError,
      coordinator,
    }),
    [
      analysisHookStatus,
      clearError,
      clearGovernedAnalysis,
      consultationId,
      coordinator,
      endConsultation,
      governedAnalysisError?.message,
      governedData,
      governedLoading,
      governedSuggestions,
      patientId,
      requestGovernedAnalysis,
      restart,
      state,
    ],
  );

  return (
    <ClinicalWorkflowContext.Provider value={value}>
      {children}
    </ClinicalWorkflowContext.Provider>
  );
}

function useClinicalWorkflowContext(): ClinicalWorkflowContextValue {
  const ctx = useContext(ClinicalWorkflowContext);
  if (!ctx) {
    throw new Error(
      "useClinicalWorkflow must be used within ClinicalWorkflowProvider",
    );
  }
  return ctx;
}

export function useClinicalWorkflow(): ClinicalWorkflowContextValue {
  return useClinicalWorkflowContext();
}

export function useClinicalWorkflowProgress() {
  return useClinicalWorkflowContext().progress;
}

export function useClinicalWorkflowStatus() {
  const { status, phase, error, sessionId } = useClinicalWorkflowContext();
  return { status, phase, error, sessionId };
}

export function useClinicalWorkflowSessionId(): string | null {
  return useClinicalWorkflowContext().sessionId;
}

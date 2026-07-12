/**
 * CB-1 — Clinical Workflow orchestration contracts.
 * Coordinates existing Copilot surfaces — no new AI, no EMR writes.
 */

export const CLINICAL_WORKFLOW_VERSION = "v1" as const;

export const CLINICAL_WORKFLOW_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};

export type ClinicalWorkflowPhase =
  | "idle"
  | "entering_consultation"
  | "bootstrapping"
  | "workspace_ready"
  | "dictation_ready"
  | "voice_intelligence_active"
  | "governed_analysis"
  | "hitl_review"
  | "consultation_complete"
  | "recoverable_error";

export type ClinicalWorkflowStatus =
  | "idle"
  | "running"
  | "awaiting_physician"
  | "completed"
  | "error";

export type WorkflowProgressStepId =
  | "consultation"
  | "bootstrap"
  | "workspace"
  | "dictation"
  | "voice_intelligence"
  | "governed_analysis"
  | "hitl"
  | "complete";

export type WorkflowProgressStep = {
  id: WorkflowProgressStepId;
  label: string;
  state: "pending" | "current" | "done" | "error";
};

export type WorkflowProgress = {
  percent: number;
  currentStepId: WorkflowProgressStepId | null;
  steps: WorkflowProgressStep[];
};

export type WorkflowRecoverableError = {
  code: string;
  message: string;
  recoverable: true;
  atPhase: ClinicalWorkflowPhase;
};

export type WorkflowState = {
  version: typeof CLINICAL_WORKFLOW_VERSION;
  phase: ClinicalWorkflowPhase;
  status: ClinicalWorkflowStatus;
  consultationId: string | null;
  patientId: string | null;
  /** Locked for the whole consultation when available. */
  sessionId: string | null;
  dictationActive: boolean;
  heuristicSuggestionCount: number;
  governedSuggestionCount: number;
  governedAnalysisStatus: "idle" | "loading" | "success" | "error" | "timeout";
  progress: WorkflowProgress;
  error: WorkflowRecoverableError | null;
  startedAt: string | null;
  updatedAt: string;
  endedAt: string | null;
  governance: typeof CLINICAL_WORKFLOW_GOVERNANCE;
};

export type WorkflowEvent =
  | {
      type: "CONSULTATION_OPENED";
      consultationId: string;
      patientId: string;
    }
  | { type: "BOOTSTRAP_STARTED" }
  | { type: "SESSION_READY"; sessionId: string }
  | { type: "BOOTSTRAP_FAILED"; message: string }
  | { type: "DICTATION_ACTIVE"; active: boolean }
  | { type: "DICTATION_READY" }
  | { type: "VOICE_INTEL_UPDATED"; suggestionCount: number }
  | { type: "GOVERNED_ANALYSIS_STARTED" }
  | {
      type: "GOVERNED_ANALYSIS_FINISHED";
      ok: boolean;
      suggestionCount: number;
      message?: string;
      timedOut?: boolean;
    }
  | { type: "ENTER_HITL_REVIEW" }
  | { type: "CONSULTATION_ENDED" }
  | { type: "RESTART"; preserveSession: boolean }
  | { type: "CLEAR_ERROR" };

export const WORKFLOW_STEP_LABELS: Record<WorkflowProgressStepId, string> = {
  consultation: "Ingreso a consulta",
  bootstrap: "Bootstrap Copilot",
  workspace: "Workspace",
  dictation: "Dictado clínico",
  voice_intelligence: "Voice Intelligence",
  governed_analysis: "Análisis gobernado",
  hitl: "Revisión médica (HITL)",
  complete: "Fin de consulta",
};

export const INITIAL_WORKFLOW_STATE: WorkflowState = {
  version: CLINICAL_WORKFLOW_VERSION,
  phase: "idle",
  status: "idle",
  consultationId: null,
  patientId: null,
  sessionId: null,
  dictationActive: false,
  heuristicSuggestionCount: 0,
  governedSuggestionCount: 0,
  governedAnalysisStatus: "idle",
  progress: {
    percent: 0,
    currentStepId: null,
    steps: [],
  },
  error: null,
  startedAt: null,
  updatedAt: new Date(0).toISOString(),
  endedAt: null,
  governance: { ...CLINICAL_WORKFLOW_GOVERNANCE },
};

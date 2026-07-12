/**
 * CP-33 — Clinical Intelligence Adapter contracts (frontend).
 * Presentation/transport only — no prompts, no local LLM, no clinical interpretation.
 */

import type { MedicalCopilotGovernance } from "../types";

export const CLINICAL_INTELLIGENCE_ADAPTER_VERSION = "v1" as const;

export type ClinicalAnalysisStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "timeout";

export type ClinicalAnalysisRequest = {
  consultationId: string;
  patientId: string;
  /** Reuse an existing Medical Copilot session when available. */
  sessionId?: string;
  appointmentId?: string;
  /**
   * Optional opaque context note for future governed integration (CP-34).
   * CP-33 does not send this as a prompt and does not interpret it locally.
   */
  contextNote?: string;
  /** Request timeout in ms (default 30_000). */
  timeoutMs?: number;
};

export type ClinicalAnalysisFinding = {
  findingId: string;
  kind: "action" | "timeline" | "memory" | "workspace";
  title: string;
  summary: string;
  sourceId: string | null;
  requiresPhysicianReview: true;
};

export type ClinicalAnalysisActionItem = {
  actionId: string;
  actionType: string;
  status: string;
  summary: string;
  priority: string | null;
  requiresPhysicianApproval: true;
  skillId: string | null;
  artifactId: string | null;
};

export type ClinicalAnalysisSessionRef = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  status: string | null;
};

export type ClinicalAnalysisResponse = {
  analysisId: string;
  session: ClinicalAnalysisSessionRef;
  status: "completed" | "partial" | "empty";
  findings: ClinicalAnalysisFinding[];
  actions: ClinicalAnalysisActionItem[];
  workspaceArtifactCount: number;
  timelineEntryCount: number;
  memoryEntryCount: number;
  governance: MedicalCopilotGovernance & {
    source: "medical_copilot_facade";
    adapterVersion: typeof CLINICAL_INTELLIGENCE_ADAPTER_VERSION;
  };
  reason: string | null;
  generatedAt: string;
  facadeStatuses: {
    session: string;
    workspace: string;
    timeline: string;
    memory: string;
    actions: string;
  };
};

export type ClinicalAnalysisErrorCode =
  | "timeout"
  | "network"
  | "facade"
  | "invalid_request"
  | "unknown";

export type ClinicalAnalysisError = {
  code: ClinicalAnalysisErrorCode;
  message: string;
  details?: string | null;
};

export type ClinicalAnalysisResult =
  | { ok: true; data: ClinicalAnalysisResponse }
  | { ok: false; error: ClinicalAnalysisError };

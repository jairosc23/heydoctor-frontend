/**
 * AI-46 — ClinicalReasoningWorkspace contracts (frontend).
 */

export const CLINICAL_REASONING_WORKSPACE_VERSION = "1.0.0" as const;

export const CLINICAL_REASONING_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalReasoningWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "reasoning_workspace_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalReasoningWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  assessmentPackageId: string;
  contextId: string;
  clinicalPlanId: string;
  confidenceId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_REASONING_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalReasoningWorkspace = {
  clinicalReasoningWorkspaceId: string;
  providerId: AiLayerProviderId;
  reasoningSlots: ClinicalReasoningWorkspaceSlot[];
  governance: typeof CLINICAL_REASONING_WORKSPACE_GOVERNANCE;
  metadata: ClinicalReasoningWorkspaceMetadata;
};

export type ClinicalReasoningWorkspaceBuilderResult = {
  source: "clinical_reasoning_workspace";
  builderVersion: typeof CLINICAL_REASONING_WORKSPACE_VERSION;
  reasoningWorkspace: ClinicalReasoningWorkspace;
  governance: typeof CLINICAL_REASONING_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

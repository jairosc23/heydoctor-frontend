/**
 * AI-44 — ClinicalReadinessWorkspace contracts (frontend).
 */

export const CLINICAL_READINESS_WORKSPACE_VERSION = "1.0.0" as const;

export const CLINICAL_READINESS_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalReadinessWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "readiness_state_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalReadinessWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  completenessId: string;
  confidenceId: string;
  reviewSummaryId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_READINESS_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalReadinessWorkspace = {
  readinessWorkspaceId: string;
  providerId: AiLayerProviderId;
  readinessSlots: ClinicalReadinessWorkspaceSlot[];
  governance: typeof CLINICAL_READINESS_WORKSPACE_GOVERNANCE;
  metadata: ClinicalReadinessWorkspaceMetadata;
};

export type ClinicalReadinessWorkspaceBuilderResult = {
  source: "clinical_readiness_workspace";
  builderVersion: typeof CLINICAL_READINESS_WORKSPACE_VERSION;
  readinessWorkspace: ClinicalReadinessWorkspace;
  governance: typeof CLINICAL_READINESS_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

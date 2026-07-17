/**
 * AI-33 — ClinicalValidationWorkspace contracts (frontend).
 */

export const CLINICAL_VALIDATION_WORKSPACE_VERSION = "1.0.0" as const;

export const CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalValidationWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "validation_state_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalValidationWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  reviewDatasetId: string;
  checklistId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_VALIDATION_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalValidationWorkspace = {
  validationWorkspaceId: string;
  providerId: AiLayerProviderId;
  validationSlots: ClinicalValidationWorkspaceSlot[];
  governance: typeof CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE;
  metadata: ClinicalValidationWorkspaceMetadata;
};

export type ClinicalValidationWorkspaceBuilderResult = {
  source: "clinical_validation_workspace";
  builderVersion: typeof CLINICAL_VALIDATION_WORKSPACE_VERSION;
  validationWorkspace: ClinicalValidationWorkspace;
  governance: typeof CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

/**
 * AI-28 — ClinicalPriorityWorkspace contracts (frontend).
 */

export const CLINICAL_PRIORITY_WORKSPACE_VERSION = "1.0.0" as const;

export const CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalPriorityWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "documentary_priority_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalPriorityWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  confidenceId: string;
  evidenceWorkspaceId: string;
  gapAnalyzerId: string;
  documentaryPriority: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_PRIORITY_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalPriorityWorkspace = {
  priorityWorkspaceId: string;
  providerId: AiLayerProviderId;
  prioritySlots: ClinicalPriorityWorkspaceSlot[];
  governance: typeof CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE;
  metadata: ClinicalPriorityWorkspaceMetadata;
};

export type ClinicalPriorityWorkspaceBuilderResult = {
  source: "clinical_priority_workspace";
  builderVersion: typeof CLINICAL_PRIORITY_WORKSPACE_VERSION;
  priorityWorkspace: ClinicalPriorityWorkspace;
  governance: typeof CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

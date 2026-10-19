/**
 * AI-48 — EvidenceCompletenessWorkspace contracts (frontend).
 */

export const EVIDENCE_COMPLETENESS_WORKSPACE_VERSION = "1.0.0" as const;

export const EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type EvidenceCompletenessWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "evidence_completeness_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type EvidenceCompletenessWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  evidenceWorkspaceId: string;
  gapAnalyzerId: string;
  missingInformationId: string;
  generatedAt: string;
  builderVersion: typeof EVIDENCE_COMPLETENESS_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type EvidenceCompletenessWorkspace = {
  evidenceCompletenessWorkspaceId: string;
  providerId: AiLayerProviderId;
  evidenceCompletenessSlots: EvidenceCompletenessWorkspaceSlot[];
  governance: typeof EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE;
  metadata: EvidenceCompletenessWorkspaceMetadata;
};

export type EvidenceCompletenessWorkspaceBuilderResult = {
  source: "evidence_completeness_workspace";
  builderVersion: typeof EVIDENCE_COMPLETENESS_WORKSPACE_VERSION;
  evidenceCompletenessWorkspace: EvidenceCompletenessWorkspace;
  governance: typeof EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

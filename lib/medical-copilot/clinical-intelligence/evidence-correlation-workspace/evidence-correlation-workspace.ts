/**
 * AI-52 — EvidenceCorrelationWorkspace contracts (frontend).
 */

export const EVIDENCE_CORRELATION_WORKSPACE_VERSION = "1.0.0" as const;

export const EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type EvidenceCorrelationWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "evidence_correlation_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type EvidenceCorrelationWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  clinicalReasoningDatasetId: string;
  evidenceMappingId: string;
  evidenceWorkspaceId: string;
  generatedAt: string;
  builderVersion: typeof EVIDENCE_CORRELATION_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type EvidenceCorrelationWorkspace = {
  evidenceCorrelationWorkspaceId: string;
  providerId: AiLayerProviderId;
  correlationSlots: EvidenceCorrelationWorkspaceSlot[];
  governance: typeof EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE;
  metadata: EvidenceCorrelationWorkspaceMetadata;
};

export type EvidenceCorrelationWorkspaceBuilderResult = {
  source: "evidence_correlation_workspace";
  builderVersion: typeof EVIDENCE_CORRELATION_WORKSPACE_VERSION;
  evidenceCorrelationWorkspace: EvidenceCorrelationWorkspace;
  governance: typeof EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

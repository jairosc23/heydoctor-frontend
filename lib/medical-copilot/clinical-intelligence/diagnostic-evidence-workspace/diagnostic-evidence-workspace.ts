/**
 * AI-26 — DiagnosticEvidenceWorkspace contracts (frontend).
 */

export const DIAGNOSTIC_EVIDENCE_WORKSPACE_VERSION = "1.0.0" as const;

export const DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type DiagnosticEvidenceWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "evidence_by_hypothesis_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type DiagnosticEvidenceWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  workspaceId: string;
  evidenceMappingId: string;
  findingRefId: string;
  generatedAt: string;
  builderVersion: typeof DIAGNOSTIC_EVIDENCE_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type DiagnosticEvidenceWorkspace = {
  evidenceWorkspaceId: string;
  providerId: AiLayerProviderId;
  evidenceViewSlots: DiagnosticEvidenceWorkspaceSlot[];
  governance: typeof DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE;
  metadata: DiagnosticEvidenceWorkspaceMetadata;
};

export type DiagnosticEvidenceWorkspaceBuilderResult = {
  source: "diagnostic_evidence_workspace";
  builderVersion: typeof DIAGNOSTIC_EVIDENCE_WORKSPACE_VERSION;
  evidenceWorkspace: DiagnosticEvidenceWorkspace;
  governance: typeof DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

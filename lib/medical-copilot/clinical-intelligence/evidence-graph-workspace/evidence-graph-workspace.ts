/**
 * AI-57 — EvidenceGraphWorkspace contracts (frontend).
 */
export const EVIDENCE_GRAPH_WORKSPACE_VERSION = "1.0.0" as const;
export const EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE = { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false } as const;
export type AiLayerProviderId = "noop" | "openai";
export type EvidenceGraphWorkspaceSlot = { id: string; sourceRefId: string | null; order: number; kind: "evidence_graph_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type EvidenceGraphWorkspaceMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningContextId: string;
  evidenceCorrelationWorkspaceId: string;
  evidenceMappingId: string;
  generatedAt: string; builderVersion: typeof EVIDENCE_GRAPH_WORKSPACE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type EvidenceGraphWorkspace = { evidenceGraphWorkspaceId: string; providerId: AiLayerProviderId; graphSlots: EvidenceGraphWorkspaceSlot[]; governance: typeof EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE; metadata: EvidenceGraphWorkspaceMetadata; };
export type EvidenceGraphWorkspaceBuilderResult = { source: "evidence_graph_workspace"; builderVersion: typeof EVIDENCE_GRAPH_WORKSPACE_VERSION; evidenceGraphWorkspace: EvidenceGraphWorkspace; governance: typeof EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE; reason: string | null; generatedAt: string; };

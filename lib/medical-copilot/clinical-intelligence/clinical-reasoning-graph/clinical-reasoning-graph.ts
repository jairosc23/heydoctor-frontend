export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_GRAPH_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_GRAPH_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningGraphSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_graph_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningGraphMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningPipelineId: string;
  evidenceGraphWorkspaceId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_GRAPH_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningGraph = { clinicalReasoningGraphId: string; providerId: AiLayerProviderId; graphSlots: ClinicalReasoningGraphSlot[]; governance: typeof CLINICAL_REASONING_GRAPH_GOVERNANCE; metadata: ClinicalReasoningGraphMetadata; };
export type ClinicalReasoningGraphBuilderResult = { source: "clinical_reasoning_graph"; builderVersion: typeof CLINICAL_REASONING_GRAPH_VERSION; clinicalReasoningGraph: ClinicalReasoningGraph; governance: typeof CLINICAL_REASONING_GRAPH_GOVERNANCE; reason: string | null; generatedAt: string; };

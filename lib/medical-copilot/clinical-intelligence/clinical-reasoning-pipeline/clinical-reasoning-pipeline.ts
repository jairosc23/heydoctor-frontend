export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_PIPELINE_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_PIPELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningPipelineSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_pipeline_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningPipelineMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningRuntimeFoundationId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_PIPELINE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningPipeline = { clinicalReasoningPipelineId: string; providerId: AiLayerProviderId; pipelineSlots: ClinicalReasoningPipelineSlot[]; governance: typeof CLINICAL_REASONING_PIPELINE_GOVERNANCE; metadata: ClinicalReasoningPipelineMetadata; };
export type ClinicalReasoningPipelineBuilderResult = { source: "clinical_reasoning_pipeline"; builderVersion: typeof CLINICAL_REASONING_PIPELINE_VERSION; clinicalReasoningPipeline: ClinicalReasoningPipeline; governance: typeof CLINICAL_REASONING_PIPELINE_GOVERNANCE; reason: string | null; generatedAt: string; };

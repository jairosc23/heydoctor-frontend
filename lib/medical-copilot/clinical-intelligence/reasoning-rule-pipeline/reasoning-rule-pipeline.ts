export type AiLayerProviderId = "noop" | "openai";
export const REASONING_RULE_PIPELINE_VERSION = "1.0.0" as const;
export const REASONING_RULE_PIPELINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ReasoningRulePipelineSlot = { id: string; sourceRefId: string | null; order: number; kind: "rule_pipeline_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ReasoningRulePipelineMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningEngineCoreId: string;
  generatedAt: string; builderVersion: typeof REASONING_RULE_PIPELINE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ReasoningRulePipeline = { reasoningRulePipelineId: string; providerId: AiLayerProviderId; pipelineSlots: ReasoningRulePipelineSlot[]; governance: typeof REASONING_RULE_PIPELINE_GOVERNANCE; metadata: ReasoningRulePipelineMetadata; };
export type ReasoningRulePipelineBuilderResult = { source: "reasoning_rule_pipeline"; builderVersion: typeof REASONING_RULE_PIPELINE_VERSION; reasoningRulePipeline: ReasoningRulePipeline; governance: typeof REASONING_RULE_PIPELINE_GOVERNANCE; reason: string | null; generatedAt: string; };

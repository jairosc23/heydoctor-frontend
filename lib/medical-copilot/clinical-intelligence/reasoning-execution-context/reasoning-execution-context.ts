export type AiLayerProviderId = "noop" | "openai";
export const REASONING_EXECUTION_CONTEXT_VERSION = "1.0.0" as const;
export const REASONING_EXECUTION_CONTEXT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ReasoningExecutionContextSlot = { id: string; sourceRefId: string | null; order: number; kind: "execution_context_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ReasoningExecutionContextMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  reasoningRulePipelineId: string;
  clinicalReasoningContextId: string;
  generatedAt: string; builderVersion: typeof REASONING_EXECUTION_CONTEXT_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ReasoningExecutionContext = { reasoningExecutionContextId: string; providerId: AiLayerProviderId; executionContextSlots: ReasoningExecutionContextSlot[]; governance: typeof REASONING_EXECUTION_CONTEXT_GOVERNANCE; metadata: ReasoningExecutionContextMetadata; };
export type ReasoningExecutionContextBuilderResult = { source: "reasoning_execution_context"; builderVersion: typeof REASONING_EXECUTION_CONTEXT_VERSION; reasoningExecutionContext: ReasoningExecutionContext; governance: typeof REASONING_EXECUTION_CONTEXT_GOVERNANCE; reason: string | null; generatedAt: string; };

export type AiLayerProviderId = "noop" | "openai";
export const GOVERNED_REASONING_RUNTIME_VERSION = "1.0.0" as const;
export const GOVERNED_REASONING_RUNTIME_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type GovernedReasoningRuntimeSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_runtime_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type GovernedReasoningRuntimeMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  reasoningExecutionContextId: string;
  governedReasoningPreparationId: string;
  generatedAt: string; builderVersion: typeof GOVERNED_REASONING_RUNTIME_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type GovernedReasoningRuntime = { governedReasoningRuntimeId: string; providerId: AiLayerProviderId; runtimeSlots: GovernedReasoningRuntimeSlot[]; governance: typeof GOVERNED_REASONING_RUNTIME_GOVERNANCE; metadata: GovernedReasoningRuntimeMetadata; };
export type GovernedReasoningRuntimeBuilderResult = { source: "governed_reasoning_runtime"; builderVersion: typeof GOVERNED_REASONING_RUNTIME_VERSION; governedReasoningRuntime: GovernedReasoningRuntime; governance: typeof GOVERNED_REASONING_RUNTIME_GOVERNANCE; reason: string | null; generatedAt: string; };

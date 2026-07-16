export type AiLayerProviderId = "noop" | "openai";
export const REASONING_STAGE_MANAGER_VERSION = "1.0.0" as const;
export const REASONING_STAGE_MANAGER_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ReasoningStageManagerSlot = { id: string; sourceRefId: string | null; order: number; kind: "stage_manager_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ReasoningStageManagerMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningEngineFoundationId: string;
  generatedAt: string; builderVersion: typeof REASONING_STAGE_MANAGER_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ReasoningStageManager = { reasoningStageManagerId: string; providerId: AiLayerProviderId; stageSlots: ReasoningStageManagerSlot[]; governance: typeof REASONING_STAGE_MANAGER_GOVERNANCE; metadata: ReasoningStageManagerMetadata; };
export type ReasoningStageManagerBuilderResult = { source: "reasoning_stage_manager"; builderVersion: typeof REASONING_STAGE_MANAGER_VERSION; reasoningStageManager: ReasoningStageManager; governance: typeof REASONING_STAGE_MANAGER_GOVERNANCE; reason: string | null; generatedAt: string; };

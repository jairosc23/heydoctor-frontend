export type AiLayerProviderId = "noop" | "openai";
export const REASONING_VALIDATION_ENGINE_VERSION = "1.0.0" as const;
export const REASONING_VALIDATION_ENGINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ReasoningValidationEngineSlot = { id: string; sourceRefId: string | null; order: number; kind: "validation_engine_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ReasoningValidationEngineMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  reasoningStateMachineId: string;
  clinicalReasoningInputPackageId: string;
  generatedAt: string; builderVersion: typeof REASONING_VALIDATION_ENGINE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ReasoningValidationEngine = { reasoningValidationEngineId: string; providerId: AiLayerProviderId; validationSlots: ReasoningValidationEngineSlot[]; governance: typeof REASONING_VALIDATION_ENGINE_GOVERNANCE; metadata: ReasoningValidationEngineMetadata; };
export type ReasoningValidationEngineBuilderResult = { source: "reasoning_validation_engine"; builderVersion: typeof REASONING_VALIDATION_ENGINE_VERSION; reasoningValidationEngine: ReasoningValidationEngine; governance: typeof REASONING_VALIDATION_ENGINE_GOVERNANCE; reason: string | null; generatedAt: string; };

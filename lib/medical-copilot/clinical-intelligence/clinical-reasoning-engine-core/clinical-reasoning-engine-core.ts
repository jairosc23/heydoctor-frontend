export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_ENGINE_CORE_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningEngineCoreSlot = { id: string; sourceRefId: string | null; order: number; kind: "engine_core_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningEngineCoreMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningInputPackageId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_ENGINE_CORE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningEngineCore = { clinicalReasoningEngineCoreId: string; providerId: AiLayerProviderId; engineCoreSlots: ClinicalReasoningEngineCoreSlot[]; governance: typeof CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE; metadata: ClinicalReasoningEngineCoreMetadata; };
export type ClinicalReasoningEngineCoreBuilderResult = { source: "clinical_reasoning_engine_core"; builderVersion: typeof CLINICAL_REASONING_ENGINE_CORE_VERSION; clinicalReasoningEngineCore: ClinicalReasoningEngineCore; governance: typeof CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE; reason: string | null; generatedAt: string; };

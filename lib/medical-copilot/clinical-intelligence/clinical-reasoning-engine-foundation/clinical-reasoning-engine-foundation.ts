export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_ENGINE_FOUNDATION_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningEngineFoundationSlot = { id: string; sourceRefId: string | null; order: number; kind: "engine_foundation_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningEngineFoundationMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  governedReasoningRuntimeId: string;
  clinicalReasoningInputPackageId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_ENGINE_FOUNDATION_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningEngineFoundation = { clinicalReasoningEngineFoundationId: string; providerId: AiLayerProviderId; foundationSlots: ClinicalReasoningEngineFoundationSlot[]; governance: typeof CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE; metadata: ClinicalReasoningEngineFoundationMetadata; };
export type ClinicalReasoningEngineFoundationBuilderResult = { source: "clinical_reasoning_engine_foundation"; builderVersion: typeof CLINICAL_REASONING_ENGINE_FOUNDATION_VERSION; clinicalReasoningEngineFoundation: ClinicalReasoningEngineFoundation; governance: typeof CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE; reason: string | null; generatedAt: string; };

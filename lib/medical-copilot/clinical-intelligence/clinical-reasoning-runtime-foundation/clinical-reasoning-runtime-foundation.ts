export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_RUNTIME_FOUNDATION_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningRuntimeFoundationSlot = { id: string; sourceRefId: string | null; order: number; kind: "runtime_foundation_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningRuntimeFoundationMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  governedReasoningSessionId: string;
  clinicalReasoningEngineFoundationId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_RUNTIME_FOUNDATION_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningRuntimeFoundation = { clinicalReasoningRuntimeFoundationId: string; providerId: AiLayerProviderId; runtimeFoundationSlots: ClinicalReasoningRuntimeFoundationSlot[]; governance: typeof CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE; metadata: ClinicalReasoningRuntimeFoundationMetadata; };
export type ClinicalReasoningRuntimeFoundationBuilderResult = { source: "clinical_reasoning_runtime_foundation"; builderVersion: typeof CLINICAL_REASONING_RUNTIME_FOUNDATION_VERSION; clinicalReasoningRuntimeFoundation: ClinicalReasoningRuntimeFoundation; governance: typeof CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE; reason: string | null; generatedAt: string; };

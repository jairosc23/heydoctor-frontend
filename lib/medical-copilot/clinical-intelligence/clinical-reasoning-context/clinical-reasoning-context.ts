/**
 * AI-56 — ClinicalReasoningContext contracts (frontend).
 */
export const CLINICAL_REASONING_CONTEXT_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_CONTEXT_GOVERNANCE = { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false } as const;
export type AiLayerProviderId = "noop" | "openai";
export type ClinicalReasoningContextSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_context_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningContextMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  governedClinicalReasoningDatasetId: string;
  contextId: string;
  clinicalPlanId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_CONTEXT_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningContext = { clinicalReasoningContextId: string; providerId: AiLayerProviderId; contextSlots: ClinicalReasoningContextSlot[]; governance: typeof CLINICAL_REASONING_CONTEXT_GOVERNANCE; metadata: ClinicalReasoningContextMetadata; };
export type ClinicalReasoningContextBuilderResult = { source: "clinical_reasoning_context"; builderVersion: typeof CLINICAL_REASONING_CONTEXT_VERSION; clinicalReasoningContext: ClinicalReasoningContext; governance: typeof CLINICAL_REASONING_CONTEXT_GOVERNANCE; reason: string | null; generatedAt: string; };

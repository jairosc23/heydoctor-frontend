/**
 * AI-58 — ClinicalReasoningInputs contracts (frontend).
 */
export const CLINICAL_REASONING_INPUTS_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_INPUTS_GOVERNANCE = { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false } as const;
export type AiLayerProviderId = "noop" | "openai";
export type ClinicalReasoningInputsSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_input_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningInputsMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  evidenceGraphWorkspaceId: string;
  clinicalPatternWorkspaceId: string;
  confidenceId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_INPUTS_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningInputs = { clinicalReasoningInputsId: string; providerId: AiLayerProviderId; inputSlots: ClinicalReasoningInputsSlot[]; governance: typeof CLINICAL_REASONING_INPUTS_GOVERNANCE; metadata: ClinicalReasoningInputsMetadata; };
export type ClinicalReasoningInputsBuilderResult = { source: "clinical_reasoning_inputs"; builderVersion: typeof CLINICAL_REASONING_INPUTS_VERSION; clinicalReasoningInputs: ClinicalReasoningInputs; governance: typeof CLINICAL_REASONING_INPUTS_GOVERNANCE; reason: string | null; generatedAt: string; };

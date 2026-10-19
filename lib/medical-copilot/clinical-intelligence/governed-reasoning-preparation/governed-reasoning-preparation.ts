/**
 * AI-59 — GovernedReasoningPreparation contracts (frontend).
 */
export const GOVERNED_REASONING_PREPARATION_VERSION = "1.0.0" as const;
export const GOVERNED_REASONING_PREPARATION_GOVERNANCE = { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false } as const;
export type AiLayerProviderId = "noop" | "openai";
export type GovernedReasoningPreparationSlot = { id: string; sourceRefId: string | null; order: number; kind: "governed_reasoning_prep_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type GovernedReasoningPreparationMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningInputsId: string;
  governedReasoningWorkspaceId: string;
  physicianReasoningPreparationId: string;
  generatedAt: string; builderVersion: typeof GOVERNED_REASONING_PREPARATION_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type GovernedReasoningPreparation = { governedReasoningPreparationId: string; providerId: AiLayerProviderId; preparationSlots: GovernedReasoningPreparationSlot[]; governance: typeof GOVERNED_REASONING_PREPARATION_GOVERNANCE; metadata: GovernedReasoningPreparationMetadata; };
export type GovernedReasoningPreparationBuilderResult = { source: "governed_reasoning_preparation"; builderVersion: typeof GOVERNED_REASONING_PREPARATION_VERSION; governedReasoningPreparation: GovernedReasoningPreparation; governance: typeof GOVERNED_REASONING_PREPARATION_GOVERNANCE; reason: string | null; generatedAt: string; };

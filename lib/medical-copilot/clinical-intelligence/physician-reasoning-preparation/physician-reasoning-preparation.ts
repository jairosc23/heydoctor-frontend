/**
 * AI-49 — PhysicianReasoningPreparation contracts (frontend).
 */

export const PHYSICIAN_REASONING_PREPARATION_VERSION = "1.0.0" as const;

export const PHYSICIAN_REASONING_PREPARATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianReasoningPreparationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "reasoning_preparation_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianReasoningPreparationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  clinicalReasoningWorkspaceId: string;
  differentialReviewWorkspaceId: string;
  evidenceCompletenessWorkspaceId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_REASONING_PREPARATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianReasoningPreparation = {
  physicianReasoningPreparationId: string;
  providerId: AiLayerProviderId;
  preparationSlots: PhysicianReasoningPreparationSlot[];
  governance: typeof PHYSICIAN_REASONING_PREPARATION_GOVERNANCE;
  metadata: PhysicianReasoningPreparationMetadata;
};

export type PhysicianReasoningPreparationBuilderResult = {
  source: "physician_reasoning_preparation";
  builderVersion: typeof PHYSICIAN_REASONING_PREPARATION_VERSION;
  reasoningPreparation: PhysicianReasoningPreparation;
  governance: typeof PHYSICIAN_REASONING_PREPARATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

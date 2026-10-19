/**
 * AI-12 — GovernedNormalizedAIResponse contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_AI_RESPONSE_NORMALIZER_VERSION = "1.0.0" as const;

export const AI_RESPONSE_NORMALIZER_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedNormalizedAIResponseSlot = {
  id: string;
  sourceInvocationSlotId: string | null;
  order: number;
  kind: "normalized_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedNormalizedAIResponseMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  composedPromptId: string;
  payloadId: string;
  invocationId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_AI_RESPONSE_NORMALIZER_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedNormalizedAIResponse = {
  normalizedId: string;
  providerId: AiLayerProviderId;
  normalizedSlots: GovernedNormalizedAIResponseSlot[];
  governance: typeof AI_RESPONSE_NORMALIZER_GOVERNANCE;
  metadata: GovernedNormalizedAIResponseMetadata;
};

export type GovernedNormalizedAIResponseBuilderResult = {
  source: "governed_ai_response_normalizer";
  builderVersion: typeof GOVERNED_AI_RESPONSE_NORMALIZER_VERSION;
  normalized: GovernedNormalizedAIResponse;
  governance: typeof AI_RESPONSE_NORMALIZER_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

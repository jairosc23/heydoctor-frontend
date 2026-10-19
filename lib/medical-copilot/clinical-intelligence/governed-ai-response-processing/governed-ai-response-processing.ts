/**
 * AI-19 — GovernedProcessedAIResponse contracts (frontend).
 */

export const GOVERNED_AI_RESPONSE_PROCESSING_VERSION = "1.0.0" as const;

export const AI_RESPONSE_PROCESSING_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedProcessedAIResponseSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "processed_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedProcessedAIResponseMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  composedPromptId: string;
  assemblyId: string;
  translationId: string;
  providerExecutionId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_AI_RESPONSE_PROCESSING_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedProcessedAIResponse = {
  processedId: string;
  providerId: AiLayerProviderId;
  processedSlots: GovernedProcessedAIResponseSlot[];
  governance: typeof AI_RESPONSE_PROCESSING_GOVERNANCE;
  metadata: GovernedProcessedAIResponseMetadata;
};

export type GovernedProcessedAIResponseBuilderResult = {
  source: "governed_ai_response_processing";
  builderVersion: typeof GOVERNED_AI_RESPONSE_PROCESSING_VERSION;
  processed: GovernedProcessedAIResponse;
  governance: typeof AI_RESPONSE_PROCESSING_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

/**
 * AI-11 — GovernedAIInvocationResult contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_AI_INVOCATION_VERSION = "1.0.0" as const;

export const AI_INVOCATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedAIInvocationResultSlot = {
  id: string;
  sourcePayloadSlotId: string | null;
  order: number;
  kind: "invocation_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedAIInvocationResultMetadata = {
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
  generatedAt: string;
  builderVersion: typeof GOVERNED_AI_INVOCATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedAIInvocationResult = {
  invocationId: string;
  providerId: AiLayerProviderId;
  invocationSlots: GovernedAIInvocationResultSlot[];
  governance: typeof AI_INVOCATION_GOVERNANCE;
  metadata: GovernedAIInvocationResultMetadata;
};

export type GovernedAIInvocationResultBuilderResult = {
  source: "governed_ai_invocation";
  builderVersion: typeof GOVERNED_AI_INVOCATION_VERSION;
  invocation: GovernedAIInvocationResult;
  governance: typeof AI_INVOCATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

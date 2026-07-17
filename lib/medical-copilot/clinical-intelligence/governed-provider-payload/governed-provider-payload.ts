/**
 * AI-10 — GovernedProviderPayload contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_PROVIDER_PAYLOAD_VERSION = "1.0.0" as const;

export const PROVIDER_PAYLOAD_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedProviderPayloadSlot = {
  id: string;
  sourceCompositionSlotId: string | null;
  order: number;
  kind: "payload_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedProviderPayloadMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  composedPromptId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PROVIDER_PAYLOAD_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedProviderPayload = {
  payloadId: string;
  providerId: AiLayerProviderId;
  payloadSlots: GovernedProviderPayloadSlot[];
  governance: typeof PROVIDER_PAYLOAD_GOVERNANCE;
  metadata: GovernedProviderPayloadMetadata;
};

export type GovernedProviderPayloadBuilderResult = {
  source: "governed_provider_payload";
  builderVersion: typeof GOVERNED_PROVIDER_PAYLOAD_VERSION;
  payload: GovernedProviderPayload;
  governance: typeof PROVIDER_PAYLOAD_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

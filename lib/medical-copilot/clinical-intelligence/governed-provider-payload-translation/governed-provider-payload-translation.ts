/**
 * AI-17 — GovernedTranslatedProviderPayload contracts (frontend).
 */

export const GOVERNED_PROVIDER_PAYLOAD_TRANSLATION_VERSION = "1.0.0" as const;

export const PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedTranslatedProviderPayloadSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "translation_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedTranslatedProviderPayloadMetadata = {
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
  targetProvider: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PROVIDER_PAYLOAD_TRANSLATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedTranslatedProviderPayload = {
  translationId: string;
  providerId: AiLayerProviderId;
  translationSlots: GovernedTranslatedProviderPayloadSlot[];
  governance: typeof PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE;
  metadata: GovernedTranslatedProviderPayloadMetadata;
};

export type GovernedTranslatedProviderPayloadBuilderResult = {
  source: "governed_provider_payload_translation";
  builderVersion: typeof GOVERNED_PROVIDER_PAYLOAD_TRANSLATION_VERSION;
  translation: GovernedTranslatedProviderPayload;
  governance: typeof PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

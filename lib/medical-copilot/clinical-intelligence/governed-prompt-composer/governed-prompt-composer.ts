/**
 * AI-9 — GovernedPrompt contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_PROMPT_COMPOSER_VERSION = "1.0.0" as const;

export const PROMPT_COMPOSER_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedPromptSlot = {
  id: string;
  sourceTemplateSlotId: string | null;
  order: number;
  kind: "composition_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedPromptMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PROMPT_COMPOSER_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedPrompt = {
  composedPromptId: string;
  providerId: AiLayerProviderId;
  compositionSlots: GovernedPromptSlot[];
  governance: typeof PROMPT_COMPOSER_GOVERNANCE;
  metadata: GovernedPromptMetadata;
};

export type GovernedPromptBuilderResult = {
  source: "governed_prompt_composer";
  builderVersion: typeof GOVERNED_PROMPT_COMPOSER_VERSION;
  composedPrompt: GovernedPrompt;
  governance: typeof PROMPT_COMPOSER_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

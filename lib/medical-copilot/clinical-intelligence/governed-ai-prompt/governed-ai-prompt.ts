/**
 * AI-7 — Governed AI Prompt Foundation contracts (frontend).
 * Structural preparation only — no prompt bodies, LLM, or clinical content.
 */

export const GOVERNED_AI_PROMPT_VERSION = "1.0.0" as const;

export const PROMPT_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type PromptProviderId = "noop" | "openai";

export type GovernedAIPromptSlot = {
  id: string;
  sourceResponseItemId: string | null;
  order: number;
  kind: "prompt_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedAIPromptMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_AI_PROMPT_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: PromptProviderId;
};

/** Public GovernedAIPrompt — structural fields only. */
export type GovernedAIPrompt = {
  promptId: string;
  providerId: PromptProviderId;
  promptSlots: GovernedAIPromptSlot[];
  governance: typeof PROMPT_GOVERNANCE;
  metadata: GovernedAIPromptMetadata;
};

export type GovernedAIPromptBuilderResult = {
  source: "governed_ai_prompt";
  builderVersion: typeof GOVERNED_AI_PROMPT_VERSION;
  prompt: GovernedAIPrompt;
  governance: typeof PROMPT_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

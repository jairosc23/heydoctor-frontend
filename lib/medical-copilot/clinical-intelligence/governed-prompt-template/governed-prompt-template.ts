/**
 * AI-8 — Governed Prompt Template Foundation contracts (frontend).
 * Structural templates only — no prompt bodies, LLM, or clinical content.
 */

export const GOVERNED_PROMPT_TEMPLATE_VERSION = "1.0.0" as const;

export const PROMPT_TEMPLATE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type PromptTemplateProviderId = "noop" | "openai";

export type GovernedPromptTemplateSlot = {
  id: string;
  sourcePromptSlotId: string | null;
  order: number;
  kind: "template_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedPromptTemplateMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PROMPT_TEMPLATE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: PromptTemplateProviderId;
};

/** Public GovernedPromptTemplate — structural fields only. */
export type GovernedPromptTemplate = {
  templateId: string;
  providerId: PromptTemplateProviderId;
  templateSlots: GovernedPromptTemplateSlot[];
  governance: typeof PROMPT_TEMPLATE_GOVERNANCE;
  metadata: GovernedPromptTemplateMetadata;
};

export type GovernedPromptTemplateBuilderResult = {
  source: "governed_prompt_template";
  builderVersion: typeof GOVERNED_PROMPT_TEMPLATE_VERSION;
  template: GovernedPromptTemplate;
  governance: typeof PROMPT_TEMPLATE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

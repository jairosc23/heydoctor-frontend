/**
 * AI-13 — GovernedClinicalAIOutput contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_CLINICAL_AI_OUTPUT_VERSION = "1.0.0" as const;

export const CLINICAL_AI_OUTPUT_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedClinicalAIOutputSlot = {
  id: string;
  sourceNormalizedSlotId: string | null;
  order: number;
  kind: "output_item";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedClinicalAIOutputMetadata = {
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
  normalizedId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_CLINICAL_AI_OUTPUT_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedClinicalAIOutput = {
  outputId: string;
  providerId: AiLayerProviderId;
  outputItems: GovernedClinicalAIOutputSlot[];
  governance: typeof CLINICAL_AI_OUTPUT_GOVERNANCE;
  metadata: GovernedClinicalAIOutputMetadata;
};

export type GovernedClinicalAIOutputBuilderResult = {
  source: "governed_clinical_ai_output";
  builderVersion: typeof GOVERNED_CLINICAL_AI_OUTPUT_VERSION;
  output: GovernedClinicalAIOutput;
  governance: typeof CLINICAL_AI_OUTPUT_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

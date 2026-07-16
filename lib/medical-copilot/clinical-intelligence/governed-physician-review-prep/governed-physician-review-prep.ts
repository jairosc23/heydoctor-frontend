/**
 * AI-14 — GovernedPhysicianReviewPrep contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_PHYSICIAN_REVIEW_PREP_VERSION = "1.0.0" as const;

export const PHYSICIAN_REVIEW_PREP_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedPhysicianReviewPrepSlot = {
  id: string;
  sourceOutputItemId: string | null;
  order: number;
  kind: "review_prep_item";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedPhysicianReviewPrepMetadata = {
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
  outputId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PHYSICIAN_REVIEW_PREP_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedPhysicianReviewPrep = {
  reviewPrepId: string;
  providerId: AiLayerProviderId;
  reviewItems: GovernedPhysicianReviewPrepSlot[];
  governance: typeof PHYSICIAN_REVIEW_PREP_GOVERNANCE;
  metadata: GovernedPhysicianReviewPrepMetadata;
};

export type GovernedPhysicianReviewPrepBuilderResult = {
  source: "governed_physician_review_prep";
  builderVersion: typeof GOVERNED_PHYSICIAN_REVIEW_PREP_VERSION;
  reviewPrep: GovernedPhysicianReviewPrep;
  governance: typeof PHYSICIAN_REVIEW_PREP_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

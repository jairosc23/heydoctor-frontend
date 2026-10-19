/**
 * AI-20 — GovernedPhysicianReviewExperience contracts (frontend).
 */

export const GOVERNED_PHYSICIAN_REVIEW_EXPERIENCE_VERSION = "1.0.0" as const;

export const PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedPhysicianReviewExperienceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "experience_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedPhysicianReviewExperienceMetadata = {
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
  processedId: string;
  decisionState: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PHYSICIAN_REVIEW_EXPERIENCE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedPhysicianReviewExperience = {
  reviewExperienceId: string;
  providerId: AiLayerProviderId;
  experienceSlots: GovernedPhysicianReviewExperienceSlot[];
  governance: typeof PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE;
  metadata: GovernedPhysicianReviewExperienceMetadata;
};

export type GovernedPhysicianReviewExperienceBuilderResult = {
  source: "governed_physician_review_experience";
  builderVersion: typeof GOVERNED_PHYSICIAN_REVIEW_EXPERIENCE_VERSION;
  reviewExperience: GovernedPhysicianReviewExperience;
  governance: typeof PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

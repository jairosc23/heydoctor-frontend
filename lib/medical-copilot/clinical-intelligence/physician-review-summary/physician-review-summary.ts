/**
 * AI-34 — PhysicianReviewSummary contracts (frontend).
 */

export const PHYSICIAN_REVIEW_SUMMARY_VERSION = "1.0.0" as const;

export const PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianReviewSummarySlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_summary_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianReviewSummaryMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  validationWorkspaceId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_REVIEW_SUMMARY_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianReviewSummary = {
  reviewSummaryId: string;
  providerId: AiLayerProviderId;
  summarySlots: PhysicianReviewSummarySlot[];
  governance: typeof PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE;
  metadata: PhysicianReviewSummaryMetadata;
};

export type PhysicianReviewSummaryBuilderResult = {
  source: "physician_review_summary";
  builderVersion: typeof PHYSICIAN_REVIEW_SUMMARY_VERSION;
  reviewSummary: PhysicianReviewSummary;
  governance: typeof PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

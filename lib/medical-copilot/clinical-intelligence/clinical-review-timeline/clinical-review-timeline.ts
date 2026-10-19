/**
 * AI-37 — ClinicalReviewTimeline contracts (frontend).
 */

export const CLINICAL_REVIEW_TIMELINE_VERSION = "1.0.0" as const;

export const CLINICAL_REVIEW_TIMELINE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalReviewTimelineSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_timeline_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalReviewTimelineMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  physicianReviewPackageId: string;
  validationWorkspaceId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_REVIEW_TIMELINE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalReviewTimeline = {
  reviewTimelineId: string;
  providerId: AiLayerProviderId;
  timelineSlots: ClinicalReviewTimelineSlot[];
  governance: typeof CLINICAL_REVIEW_TIMELINE_GOVERNANCE;
  metadata: ClinicalReviewTimelineMetadata;
};

export type ClinicalReviewTimelineBuilderResult = {
  source: "clinical_review_timeline";
  builderVersion: typeof CLINICAL_REVIEW_TIMELINE_VERSION;
  reviewTimeline: ClinicalReviewTimeline;
  governance: typeof CLINICAL_REVIEW_TIMELINE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

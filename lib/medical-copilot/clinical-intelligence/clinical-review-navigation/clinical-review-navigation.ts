/**
 * AI-38 — ClinicalReviewNavigation contracts (frontend).
 */

export const CLINICAL_REVIEW_NAVIGATION_VERSION = "1.0.0" as const;

export const CLINICAL_REVIEW_NAVIGATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalReviewNavigationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_navigation_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalReviewNavigationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  reviewTimelineId: string;
  checklistWorkspaceId: string;
  validationWorkspaceId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_REVIEW_NAVIGATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalReviewNavigation = {
  reviewNavigationId: string;
  providerId: AiLayerProviderId;
  navigationSlots: ClinicalReviewNavigationSlot[];
  governance: typeof CLINICAL_REVIEW_NAVIGATION_GOVERNANCE;
  metadata: ClinicalReviewNavigationMetadata;
};

export type ClinicalReviewNavigationBuilderResult = {
  source: "clinical_review_navigation";
  builderVersion: typeof CLINICAL_REVIEW_NAVIGATION_VERSION;
  reviewNavigation: ClinicalReviewNavigation;
  governance: typeof CLINICAL_REVIEW_NAVIGATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

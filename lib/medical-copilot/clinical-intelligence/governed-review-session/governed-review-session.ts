/**
 * AI-40 — GovernedReviewSession contracts (frontend).
 */

export const GOVERNED_REVIEW_SESSION_VERSION = "1.0.0" as const;

export const GOVERNED_REVIEW_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedReviewSessionSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "governed_review_session_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedReviewSessionMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  physicianReviewPackageId: string;
  checklistWorkspaceId: string;
  reviewTimelineId: string;
  reviewNavigationId: string;
  reviewDashboardId: string;
  reviewSummaryId: string;
  validationWorkspaceId: string;
  sessionPackageId: string;
  workspaceId: string;
  reviewWorkspaceV2Id: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_REVIEW_SESSION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedReviewSession = {
  reviewSessionId: string;
  providerId: AiLayerProviderId;
  sessionSlots: GovernedReviewSessionSlot[];
  governance: typeof GOVERNED_REVIEW_SESSION_GOVERNANCE;
  metadata: GovernedReviewSessionMetadata;
};

export type GovernedReviewSessionBuilderResult = {
  source: "governed_review_session";
  builderVersion: typeof GOVERNED_REVIEW_SESSION_VERSION;
  reviewSession: GovernedReviewSession;
  governance: typeof GOVERNED_REVIEW_SESSION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

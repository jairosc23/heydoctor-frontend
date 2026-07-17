/**
 * AI-39 — PhysicianReviewDashboard contracts (frontend).
 */

export const PHYSICIAN_REVIEW_DASHBOARD_VERSION = "1.0.0" as const;

export const PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianReviewDashboardSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_dashboard_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianReviewDashboardMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  checklistWorkspaceId: string;
  reviewTimelineId: string;
  reviewNavigationId: string;
  reviewSummaryId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_REVIEW_DASHBOARD_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianReviewDashboard = {
  reviewDashboardId: string;
  providerId: AiLayerProviderId;
  dashboardSlots: PhysicianReviewDashboardSlot[];
  governance: typeof PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE;
  metadata: PhysicianReviewDashboardMetadata;
};

export type PhysicianReviewDashboardBuilderResult = {
  source: "physician_review_dashboard";
  builderVersion: typeof PHYSICIAN_REVIEW_DASHBOARD_VERSION;
  reviewDashboard: PhysicianReviewDashboard;
  governance: typeof PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

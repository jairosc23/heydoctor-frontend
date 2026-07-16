/**
 * AI-29 — PhysicianReviewWorkspaceV2 contracts (frontend).
 */

export const PHYSICIAN_REVIEW_WORKSPACE_V2_VERSION = "1.0.0" as const;

export const PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianReviewWorkspaceV2Slot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_workspace_v2_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianReviewWorkspaceV2Metadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  workspaceId: string;
  evidenceWorkspaceId: string;
  gapAnalyzerId: string;
  priorityWorkspaceId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_REVIEW_WORKSPACE_V2_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianReviewWorkspaceV2 = {
  reviewWorkspaceV2Id: string;
  providerId: AiLayerProviderId;
  reviewViewSlots: PhysicianReviewWorkspaceV2Slot[];
  governance: typeof PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE;
  metadata: PhysicianReviewWorkspaceV2Metadata;
};

export type PhysicianReviewWorkspaceV2BuilderResult = {
  source: "physician_review_workspace_v2";
  builderVersion: typeof PHYSICIAN_REVIEW_WORKSPACE_V2_VERSION;
  reviewWorkspaceV2: PhysicianReviewWorkspaceV2;
  governance: typeof PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

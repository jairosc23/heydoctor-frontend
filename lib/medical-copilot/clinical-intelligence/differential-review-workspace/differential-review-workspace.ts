/**
 * AI-47 — DifferentialReviewWorkspace contracts (frontend).
 */

export const DIFFERENTIAL_REVIEW_WORKSPACE_VERSION = "1.0.0" as const;

export const DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type DifferentialReviewWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "differential_review_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type DifferentialReviewWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  differentialId: string;
  evidenceMappingId: string;
  confidenceId: string;
  generatedAt: string;
  builderVersion: typeof DIFFERENTIAL_REVIEW_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type DifferentialReviewWorkspace = {
  differentialReviewWorkspaceId: string;
  providerId: AiLayerProviderId;
  differentialReviewSlots: DifferentialReviewWorkspaceSlot[];
  governance: typeof DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE;
  metadata: DifferentialReviewWorkspaceMetadata;
};

export type DifferentialReviewWorkspaceBuilderResult = {
  source: "differential_review_workspace";
  builderVersion: typeof DIFFERENTIAL_REVIEW_WORKSPACE_VERSION;
  differentialReviewWorkspace: DifferentialReviewWorkspace;
  governance: typeof DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

/**
 * AI-35 — GovernedPhysicianReviewPackage contracts (frontend).
 */

export const GOVERNED_PHYSICIAN_REVIEW_PACKAGE_VERSION = "1.0.0" as const;

export const GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedPhysicianReviewPackageSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "physician_review_package_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedPhysicianReviewPackageMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  reviewDatasetId: string;
  checklistId: string;
  validationWorkspaceId: string;
  reviewSummaryId: string;
  sessionPackageId: string;
  contextId: string;
  clinicalPlanId: string;
  reviewId: string;
  caseId: string;
  workspaceId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_PHYSICIAN_REVIEW_PACKAGE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedPhysicianReviewPackage = {
  physicianReviewPackageId: string;
  providerId: AiLayerProviderId;
  packageSlots: GovernedPhysicianReviewPackageSlot[];
  governance: typeof GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE;
  metadata: GovernedPhysicianReviewPackageMetadata;
};

export type GovernedPhysicianReviewPackageBuilderResult = {
  source: "governed_physician_review_package";
  builderVersion: typeof GOVERNED_PHYSICIAN_REVIEW_PACKAGE_VERSION;
  physicianReviewPackage: GovernedPhysicianReviewPackage;
  governance: typeof GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

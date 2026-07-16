/**
 * AI-31 — ClinicalReviewDatasetFoundation contracts (frontend).
 */

export const CLINICAL_REVIEW_DATASET_FOUNDATION_VERSION = "1.0.0" as const;

export const CLINICAL_REVIEW_DATASET_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalReviewDatasetFoundationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_dataset_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalReviewDatasetFoundationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  sessionPackageId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_REVIEW_DATASET_FOUNDATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalReviewDatasetFoundation = {
  reviewDatasetId: string;
  providerId: AiLayerProviderId;
  datasetSlots: ClinicalReviewDatasetFoundationSlot[];
  governance: typeof CLINICAL_REVIEW_DATASET_GOVERNANCE;
  metadata: ClinicalReviewDatasetFoundationMetadata;
};

export type ClinicalReviewDatasetFoundationBuilderResult = {
  source: "clinical_review_dataset_foundation";
  builderVersion: typeof CLINICAL_REVIEW_DATASET_FOUNDATION_VERSION;
  reviewDataset: ClinicalReviewDatasetFoundation;
  governance: typeof CLINICAL_REVIEW_DATASET_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

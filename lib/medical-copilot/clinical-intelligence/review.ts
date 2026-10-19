/**
 * CI-7 — Governed Clinical Review contracts (frontend).
 * Reorganization of Snapshot — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_REVIEW_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_REVIEW_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalReviewLayer =
  | "findings"
  | "insights"
  | "recommendations"
  | "decisions"
  | "reasoning";

export type ClinicalReviewItem = {
  id: string;
  layer: ClinicalReviewLayer;
  sourceId: string;
  category: string;
  summary: string;
};

export type ClinicalReviewMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  generatedAt: string;
  engineVersion: typeof CLINICAL_REVIEW_ENGINE_VERSION;
  status: "ok" | "empty" | "partial";
  itemCount: number;
};

export type ClinicalReview = {
  snapshotId: string;
  reviewItems: ClinicalReviewItem[];
  governance: typeof CLINICAL_REVIEW_GOVERNANCE;
  metadata: ClinicalReviewMetadata;
};

export type ClinicalReviewResult = {
  source: "governed_clinical_review_engine";
  engineVersion: typeof CLINICAL_REVIEW_ENGINE_VERSION;
  review: ClinicalReview;
  governance: typeof CLINICAL_REVIEW_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

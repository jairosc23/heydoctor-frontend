/**
 * CI-8 — Clinical Case Representation contracts (frontend).
 * Reorganization of ClinicalReview — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_CASE_REPRESENTATION_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_CASE_REPRESENTATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalCaseSectionLayer =
  | "findings"
  | "insights"
  | "recommendations"
  | "decisions"
  | "reasoning";

export type ClinicalCaseSection = {
  id: string;
  layer: ClinicalCaseSectionLayer;
  title: string;
  itemIds: string[];
  summaries: string[];
};

export type ClinicalCaseRepresentationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  snapshotId: string;
  generatedAt: string;
  engineVersion: typeof CLINICAL_CASE_REPRESENTATION_ENGINE_VERSION;
  status: "ok" | "empty" | "partial";
  sectionCount: number;
  itemCount: number;
};

export type ClinicalCaseRepresentation = {
  reviewId: string;
  sections: ClinicalCaseSection[];
  governance: typeof CLINICAL_CASE_REPRESENTATION_GOVERNANCE;
  metadata: ClinicalCaseRepresentationMetadata;
};

export type ClinicalCaseRepresentationResult = {
  source: "clinical_case_representation_engine";
  engineVersion: typeof CLINICAL_CASE_REPRESENTATION_ENGINE_VERSION;
  representation: ClinicalCaseRepresentation;
  governance: typeof CLINICAL_CASE_REPRESENTATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

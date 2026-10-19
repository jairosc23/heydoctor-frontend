/**
 * CI-9 — Clinical Context contracts (frontend).
 * Consolidation of ClinicalCaseRepresentation — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_CONTEXT_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_CONTEXT_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalContextLayer =
  | "findings"
  | "insights"
  | "recommendations"
  | "decisions"
  | "reasoning";

export type ClinicalContextItem = {
  id: string;
  sectionId: string;
  layer: ClinicalContextLayer;
  sourceItemId: string;
  summary: string;
};

export type ClinicalContextMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  snapshotId: string;
  reviewId: string;
  generatedAt: string;
  engineVersion: typeof CLINICAL_CONTEXT_ENGINE_VERSION;
  status: "ok" | "empty" | "partial";
  itemCount: number;
};

export type ClinicalContext = {
  caseRepresentationId: string;
  contextItems: ClinicalContextItem[];
  governance: typeof CLINICAL_CONTEXT_GOVERNANCE;
  metadata: ClinicalContextMetadata;
};

export type ClinicalContextResult = {
  source: "clinical_context_engine";
  engineVersion: typeof CLINICAL_CONTEXT_ENGINE_VERSION;
  context: ClinicalContext;
  governance: typeof CLINICAL_CONTEXT_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

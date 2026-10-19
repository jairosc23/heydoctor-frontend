/**
 * CI-10 — Clinical Planning contracts (frontend).
 * Structural reorganization of ClinicalContext — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_PLANNING_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_PLANNING_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalPlanItemKind =
  | "to_review"
  | "pending"
  | "available"
  | "missing";

export type ClinicalPlanLayer =
  | "findings"
  | "insights"
  | "recommendations"
  | "decisions"
  | "reasoning";

export type ClinicalPlanItem = {
  id: string;
  kind: ClinicalPlanItemKind;
  order: number;
  layer: ClinicalPlanLayer;
  sourceContextItemId: string | null;
  summary: string;
};

export type ClinicalPlanMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  snapshotId: string;
  reviewId: string;
  generatedAt: string;
  engineVersion: typeof CLINICAL_PLANNING_ENGINE_VERSION;
  status: "ok" | "empty" | "partial";
  itemCount: number;
  toReviewCount: number;
  pendingCount: number;
  availableCount: number;
  missingCount: number;
};

export type ClinicalPlan = {
  contextId: string;
  planItems: ClinicalPlanItem[];
  governance: typeof CLINICAL_PLANNING_GOVERNANCE;
  metadata: ClinicalPlanMetadata;
};

export type ClinicalPlanResult = {
  source: "clinical_planning_engine";
  engineVersion: typeof CLINICAL_PLANNING_ENGINE_VERSION;
  plan: ClinicalPlan;
  governance: typeof CLINICAL_PLANNING_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

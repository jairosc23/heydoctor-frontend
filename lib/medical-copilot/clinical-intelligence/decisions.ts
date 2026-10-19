/**
 * CI-4 — Clinical Decision Support Engine contracts (frontend).
 * Deterministic consolidation of Recommendations — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_DECISION_SUPPORT_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_DECISION_SUPPORT_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalDecisionCategory =
  | "session"
  | "workspace"
  | "timeline"
  | "memory"
  | "governed_analysis"
  | "system";

export type ClinicalDecisionPriority = "low" | "medium" | "high" | "urgent";

export type ClinicalDecisionSource = "clinical_recommendations";

export type ClinicalDecisionReference = {
  kind: string;
  id: string;
};

export type ClinicalDecision = {
  id: string;
  category: ClinicalDecisionCategory;
  priority: ClinicalDecisionPriority;
  source: ClinicalDecisionSource;
  confidence: number;
  summary: string;
  recommendationIds: string[];
  references: ClinicalDecisionReference[];
  governance: typeof CLINICAL_DECISION_SUPPORT_GOVERNANCE;
};

export type ClinicalDecisionCollection = {
  decisions: ClinicalDecision[];
  byCategory: Partial<Record<ClinicalDecisionCategory, ClinicalDecision[]>>;
  byPriority: Partial<Record<ClinicalDecisionPriority, ClinicalDecision[]>>;
  count: number;
};

export type ClinicalDecisionResult = {
  source: "clinical_decision_support_engine";
  engineVersion: typeof CLINICAL_DECISION_SUPPORT_ENGINE_VERSION;
  sessionId: string;
  consultationId: string;
  patientId: string;
  status: "ok" | "empty" | "partial";
  collection: ClinicalDecisionCollection;
  governance: typeof CLINICAL_DECISION_SUPPORT_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

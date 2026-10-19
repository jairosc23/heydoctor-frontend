/**
 * CI-2 — Clinical Insight Engine contracts (frontend).
 * Deterministic consolidation of Findings — no recommendations, diagnoses, or EMR writes.
 */

export const CLINICAL_INSIGHT_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_INSIGHT_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalInsightCategory =
  | "session"
  | "workspace"
  | "timeline"
  | "memory"
  | "governed_analysis"
  | "system";

export type ClinicalInsightSeverity = "info" | "low" | "medium" | "high";

export type ClinicalInsightSource = "clinical_findings";

export type ClinicalInsightReference = {
  kind: string;
  id: string;
};

export type ClinicalInsight = {
  id: string;
  category: ClinicalInsightCategory;
  severity: ClinicalInsightSeverity;
  source: ClinicalInsightSource;
  confidence: number;
  summary: string;
  findingIds: string[];
  references: ClinicalInsightReference[];
  governance: typeof CLINICAL_INSIGHT_GOVERNANCE;
};

export type ClinicalInsightCollection = {
  insights: ClinicalInsight[];
  byCategory: Partial<Record<ClinicalInsightCategory, ClinicalInsight[]>>;
  bySeverity: Partial<Record<ClinicalInsightSeverity, ClinicalInsight[]>>;
  count: number;
};

export type ClinicalInsightResult = {
  source: "clinical_insight_engine";
  engineVersion: typeof CLINICAL_INSIGHT_ENGINE_VERSION;
  sessionId: string;
  consultationId: string;
  patientId: string;
  status: "ok" | "empty" | "partial";
  collection: ClinicalInsightCollection;
  governance: typeof CLINICAL_INSIGHT_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

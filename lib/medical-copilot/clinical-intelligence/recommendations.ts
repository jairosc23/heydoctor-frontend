/**
 * CI-3 — Clinical Recommendation Engine contracts (frontend).
 * Deterministic consolidation of Insights — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_RECOMMENDATION_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_RECOMMENDATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalRecommendationCategory =
  | "session"
  | "workspace"
  | "timeline"
  | "memory"
  | "governed_analysis"
  | "system";

export type ClinicalRecommendationPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export type ClinicalRecommendationSource = "clinical_insights";

export type ClinicalRecommendationReference = {
  kind: string;
  id: string;
};

export type ClinicalRecommendation = {
  id: string;
  category: ClinicalRecommendationCategory;
  priority: ClinicalRecommendationPriority;
  source: ClinicalRecommendationSource;
  confidence: number;
  summary: string;
  insightIds: string[];
  references: ClinicalRecommendationReference[];
  governance: typeof CLINICAL_RECOMMENDATION_GOVERNANCE;
};

export type ClinicalRecommendationCollection = {
  recommendations: ClinicalRecommendation[];
  byCategory: Partial<
    Record<ClinicalRecommendationCategory, ClinicalRecommendation[]>
  >;
  byPriority: Partial<
    Record<ClinicalRecommendationPriority, ClinicalRecommendation[]>
  >;
  count: number;
};

export type ClinicalRecommendationResult = {
  source: "clinical_recommendation_engine";
  engineVersion: typeof CLINICAL_RECOMMENDATION_ENGINE_VERSION;
  sessionId: string;
  consultationId: string;
  patientId: string;
  status: "ok" | "empty" | "partial";
  collection: ClinicalRecommendationCollection;
  governance: typeof CLINICAL_RECOMMENDATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

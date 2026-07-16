/**
 * CI-1 — Clinical Intelligence Engine Finding contracts (frontend).
 * Decoupled observations only — no recommendations, diagnoses, or EMR writes.
 */

export const CLINICAL_INTELLIGENCE_ENGINE_VERSION = "1.0.0" as const;

export const CLINICAL_INTELLIGENCE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalFindingCategory =
  | "session"
  | "workspace"
  | "timeline"
  | "memory"
  | "governed_analysis"
  | "system";

export type ClinicalFindingSeverity = "info" | "low" | "medium" | "high";

export type ClinicalFindingSource =
  | "workspace"
  | "timeline"
  | "conversation_memory"
  | "governed_analysis"
  | "session";

export type ClinicalFindingReference = {
  kind: ClinicalFindingSource;
  id: string;
};

export type ClinicalFinding = {
  id: string;
  category: ClinicalFindingCategory;
  severity: ClinicalFindingSeverity;
  source: ClinicalFindingSource;
  confidence: number;
  summary: string;
  references: ClinicalFindingReference[];
  governance: typeof CLINICAL_INTELLIGENCE_GOVERNANCE;
};

export type ClinicalFindingCollection = {
  findings: ClinicalFinding[];
  byCategory: Partial<Record<ClinicalFindingCategory, ClinicalFinding[]>>;
  bySeverity: Partial<Record<ClinicalFindingSeverity, ClinicalFinding[]>>;
  count: number;
};

export type ClinicalIntelligenceResult = {
  source: "clinical_intelligence_engine";
  engineVersion: typeof CLINICAL_INTELLIGENCE_ENGINE_VERSION;
  sessionId: string;
  consultationId: string;
  patientId: string;
  status: "ok" | "empty" | "partial";
  collection: ClinicalFindingCollection;
  governance: typeof CLINICAL_INTELLIGENCE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

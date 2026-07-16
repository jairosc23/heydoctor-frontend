/**
 * CI-5 — Governed Clinical Reasoning Engine contracts (frontend).
 * Deterministic consolidation of Decisions — no diagnoses, treatments, or EMR writes.
 * Distinct from Core ClinicalReasoningEngine.
 */

export const GOVERNED_CLINICAL_REASONING_ENGINE_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_REASONING_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalReasoningCategory =
  | "session"
  | "workspace"
  | "timeline"
  | "memory"
  | "governed_analysis"
  | "system";

/** Structural confidence 0..1 */
export type ClinicalReasoningConfidence = number;

export type ClinicalReasoningSource = "clinical_decisions";

export type ClinicalReasoningReference = {
  kind: string;
  id: string;
};

export type ClinicalReasoning = {
  id: string;
  category: ClinicalReasoningCategory;
  confidence: ClinicalReasoningConfidence;
  source: ClinicalReasoningSource;
  summary: string;
  decisionIds: string[];
  references: ClinicalReasoningReference[];
  governance: typeof GOVERNED_CLINICAL_REASONING_GOVERNANCE;
};

export type ClinicalReasoningCollection = {
  reasonings: ClinicalReasoning[];
  byCategory: Partial<Record<ClinicalReasoningCategory, ClinicalReasoning[]>>;
  count: number;
};

export type ClinicalReasoningResult = {
  source: "governed_clinical_reasoning_engine";
  engineVersion: typeof GOVERNED_CLINICAL_REASONING_ENGINE_VERSION;
  sessionId: string;
  consultationId: string;
  patientId: string;
  status: "ok" | "empty" | "partial";
  collection: ClinicalReasoningCollection;
  governance: typeof GOVERNED_CLINICAL_REASONING_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};

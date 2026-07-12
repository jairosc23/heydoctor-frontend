/**
 * CP-32 — Clinical Voice Intelligence types.
 * Heuristic suggestions only — no LLM, no EMR writes, no persistence.
 */

export type ClinicalSuggestionType =
  | "incomplete_text"
  | "pending_clinical_section"
  | "structural_inconsistency"
  | "manual_review"
  | "configurable_reminder";

export type ClinicalSuggestionSeverity = "info" | "attention" | "review";

export type ClinicalSuggestion = {
  suggestionId: string;
  type: ClinicalSuggestionType;
  severity: ClinicalSuggestionSeverity;
  title: string;
  detail: string;
  /** Always true in CP-32 — non-binding. */
  requiresPhysicianReview: true;
  /** Never auto-applied to dictation text. */
  autoAppliesToDictation: false;
};

export type ClinicalVoiceAnalysis = {
  analysisId: string;
  analyzedAt: string;
  sourceTextLength: number;
  sourceTextHash: string;
  suggestions: ClinicalSuggestion[];
  /** Governance markers for UI. */
  governance: {
    requiresPhysicianReview: true;
    generatesSoap: false;
    writesToEmr: false;
    usesGenerativeAi: false;
  };
};

export type ClinicalVoiceIntelligenceOptions = {
  /** Minimum characters before incomplete_text fires (default 40). */
  minCompleteLength?: number;
  /** Extra reminder titles the host may configure (ephemeral). */
  reminders?: string[];
  /** Clinical section keywords expected in a fuller note (Spanish). */
  expectedSections?: string[];
};

export const DEFAULT_EXPECTED_SECTIONS = [
  "motivo",
  "anamnesis",
  "examen",
  "diagnóstico",
  "plan",
] as const;

export const CLINICAL_VOICE_INTELLIGENCE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  generatesSoap: false as const,
  writesToEmr: false as const,
  usesGenerativeAi: false as const,
};

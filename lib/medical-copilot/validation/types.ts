/**
 * CB-3 — Clinical Validation Foundation contracts (PHI-safe, voluntary).
 * Experience feedback only — never clinical content or clinical identifiers.
 */

/** Semantic version of the Beta questionnaire instrument. */
export type ValidationQuestionnaireVersion = "v1.1.0";

export const VALIDATION_QUESTIONNAIRE_VERSION: ValidationQuestionnaireVersion =
  "v1.1.0";

/** Module contract version (foundation). */
export const CLINICAL_VALIDATION_VERSION = "v1" as const;

/** Likert scale 1–5 (optional unanswered = null). */
export type ValidationLikert = 1 | 2 | 3 | 4 | 5;

export type ValidationQuestionId =
  | "perceived_utility"
  | "suggestion_clarity"
  | "dictation_ease"
  | "copilot_trust"
  | "overall_satisfaction"
  | "perceived_response_time"
  | "willingness_to_reuse";

export type ValidationIncidentCategory =
  | "none"
  | "ui_bug"
  | "voice_issue"
  | "performance"
  | "unclear_suggestions"
  | "other";

export type ValidationQuestion = {
  id: ValidationQuestionId;
  prompt: string;
  helpText: string;
};

export type ValidationQuestionnaire = {
  /** Instrument version — independent of foundation module version. */
  questionnaireVersion: ValidationQuestionnaireVersion;
  version: typeof CLINICAL_VALIDATION_VERSION;
  title: string;
  description: string;
  questions: ValidationQuestion[];
  incidentPrompt: string;
  optionalCommentPrompt: string;
  /** Max chars for optional free-text (PHI-scrubbed). */
  maxCommentLength: number;
};

export type ValidationAnswers = {
  perceived_utility: ValidationLikert | null;
  suggestion_clarity: ValidationLikert | null;
  dictation_ease: ValidationLikert | null;
  copilot_trust: ValidationLikert | null;
  overall_satisfaction: ValidationLikert | null;
  perceived_response_time: ValidationLikert | null;
  willingness_to_reuse: ValidationLikert | null;
  incidentCategory: ValidationIncidentCategory;
  /** Scrubbed UX comment only — never dictation/clinical text. */
  optionalComment: string | null;
};

export type ValidationSessionStatus =
  | "idle"
  | "open"
  | "submitted"
  | "dismissed";

export type ValidationSession = {
  validationSessionId: string;
  version: typeof CLINICAL_VALIDATION_VERSION;
  questionnaireVersion: ValidationQuestionnaireVersion;
  /** Anonymous Beta cohort tag only — never clinical identifiers. */
  cohortTag: string | null;
  status: ValidationSessionStatus;
  startedAt: string | null;
  submittedAt: string | null;
  dismissedAt: string | null;
  answers: ValidationAnswers;
};

export type ValidationEventType =
  | "validation_opened"
  | "validation_answer_updated"
  | "validation_submitted"
  | "validation_dismissed"
  | "validation_reset"
  | "incident_reported";

export type ValidationEvent = {
  eventId: string;
  type: ValidationEventType;
  at: string;
  validationSessionId: string;
  questionnaireVersion: ValidationQuestionnaireVersion;
  /** PHI-safe technical payload only. */
  detail: {
    questionId?: ValidationQuestionId;
    likert?: ValidationLikert | null;
    incidentCategory?: ValidationIncidentCategory;
    status?: ValidationSessionStatus;
    hasComment?: boolean;
  };
};

export type TrustDistribution = Record<ValidationLikert, number>;

export type ValidationMetrics = {
  questionnaireVersion: ValidationQuestionnaireVersion;
  /** Sesiones evaluadas (cuestionario enviado). */
  evaluatedSessions: number;
  sessionsOpened: number;
  sessionsSubmitted: number;
  sessionsDismissed: number;
  /** Tasa de finalización = submitted / opened. */
  questionnaireCompletionRate: number;
  /** Alias histórico de completion rate. */
  responseRate: number;
  /** Puntuación media por categoría Likert. */
  averageScores: Partial<Record<ValidationQuestionId, number | null>>;
  /**
   * Net Satisfaction Score interno (−100…100).
   * Promoters (4–5) vs detractors (1–2) sobre overall_satisfaction.
   */
  netSatisfactionScore: number | null;
  incidentCounts: Record<ValidationIncidentCategory, number>;
  /** Distribución de confianza (copilot_trust). */
  trustDistribution: TrustDistribution;
  commentProvidedCount: number;
};

/** Exportable Beta aggregate payload (no PHI / no clinical IDs). */
export type ValidationMetricsExport = {
  exportedAt: string;
  foundationVersion: typeof CLINICAL_VALIDATION_VERSION;
  metrics: ValidationMetrics;
};

export const EMPTY_VALIDATION_ANSWERS: ValidationAnswers = {
  perceived_utility: null,
  suggestion_clarity: null,
  dictation_ease: null,
  copilot_trust: null,
  overall_satisfaction: null,
  perceived_response_time: null,
  willingness_to_reuse: null,
  incidentCategory: "none",
  optionalComment: null,
};

export const EMPTY_TRUST_DISTRIBUTION: TrustDistribution = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

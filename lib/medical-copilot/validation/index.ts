/**
 * CB-3 — Clinical Validation Foundation public surface.
 */

export type {
  TrustDistribution,
  ValidationAnswers,
  ValidationEvent,
  ValidationEventType,
  ValidationIncidentCategory,
  ValidationLikert,
  ValidationMetrics,
  ValidationMetricsExport,
  ValidationQuestion,
  ValidationQuestionId,
  ValidationQuestionnaire,
  ValidationQuestionnaireVersion,
  ValidationSession,
  ValidationSessionStatus,
} from "./types";

export {
  CLINICAL_VALIDATION_VERSION,
  EMPTY_TRUST_DISTRIBUTION,
  EMPTY_VALIDATION_ANSWERS,
  VALIDATION_QUESTIONNAIRE_VERSION,
} from "./types";

export { DEFAULT_VALIDATION_QUESTIONNAIRE } from "./questionnaire";

export {
  computeNetSatisfactionScore,
  computeValidationMetrics,
  createEmptyValidationMetrics,
  exportValidationMetrics,
  VALIDATION_QUESTION_IDS,
} from "./metrics";

export { scrubValidationComment, truncateConsultationRef } from "./phi";

export {
  createClinicalValidationService,
  type ClinicalValidationService,
} from "./service";

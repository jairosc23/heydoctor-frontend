/**
 * Prescription Engine — Clinical Safety Gate domain contracts.
 * Integration sprint: FE ↔ BE wired. No clinical rule engine in FE.
 */

export type SafetySeverity = "INFO" | "WARNING" | "CRITICAL";

/** Presentation order only — never changes clinical severity. */
export type SafetyPriority = "HIGH" | "NORMAL" | "LOW";

/** Representation only — no confidence calculation in FE. */
export type SafetyConfidence = "HIGH" | "PARTIAL" | "LOW";

export type SafetyAlertFamily =
  | "allergy_match"
  | "therapeutic_duplication"
  | "incomplete_safety_context"
  | "contraindication"
  | "dose_out_of_range"
  | "drug_interaction"
  | "special_population";

export type SafetyAlertRequirement = "none" | "ack" | "justification";

export type SafetyAlert = {
  alertId: string;
  ruleId: string;
  family: SafetyAlertFamily;
  severity: SafetySeverity;
  priority: SafetyPriority;
  confidence: SafetyConfidence;
  message: string;
  evidenceSummary?: string;
  lineIndexes: number[];
  source: string;
  requires: SafetyAlertRequirement;
  /** Arrival order for stable sort (lower = earlier). */
  arrivedAt: number;
};

export type SafetyRuleResult = {
  ruleId: string;
  family: SafetyAlertFamily;
  alerts: SafetyAlert[];
};

export type SafetyEvaluation = {
  evaluationId: string;
  evaluatedAt: string;
  engineVersion: string;
  patientId: string;
  consultationId?: string | null;
  alerts: SafetyAlert[];
  ruleResults?: SafetyRuleResult[];
};

export type WarningAcknowledgement = {
  alertId: string;
  acknowledgedAt: string;
};

export type CriticalJustification = {
  alertId: string;
  reasonCode: string;
  reasonText: string;
  justifiedAt: string;
};

/**
 * Soft UX readiness signal (frontend only).
 * Never confused with PersistedIssueDecision (backend audit trail).
 */
export type UxIssueDecision =
  | "ready"
  | "ready_with_info_only"
  | "needs_ack"
  | "needs_justification";

/**
 * @deprecated Use UxIssueDecision. Kept for transitional imports.
 */
export type IssueDecision = UxIssueDecision;

/**
 * Backend audit trail issue decision (PR-4.3).
 * Derived server-side on persist — FE must not invent these values.
 */
export type PersistedIssueDecision =
  | "evaluated_not_persisted"
  | "issued"
  | "issued_with_acknowledgements"
  | "issued_with_justifications"
  | "issued_incomplete_decisions";

/**
 * Clinical decision state: evaluation + physician UX actions.
 * Soft gate only — never hard-blocks emission.
 */
export type ClinicalDecisionState = {
  evaluationId: string | null;
  acknowledgements: WarningAcknowledgement[];
  justifications: CriticalJustification[];
  pendingWarningAcks: string[];
  pendingCriticalJustifications: string[];
  openInfoCount: number;
  openWarningCount: number;
  openCriticalCount: number;
  /** Soft readiness signal — does not disable save. */
  readyToIssue: boolean;
  /** UX readiness only — not the BE persisted issueDecision. */
  uxIssueDecision: UxIssueDecision;
};

/**
 * @deprecated Use ClinicalDecisionState.
 */
export type DecisionState = ClinicalDecisionState;

/** Payload accepted by BE create/update `safetyDecision`. */
export type SafetyDecisionPayload = {
  evaluationId?: string;
  acknowledgements: WarningAcknowledgement[];
  justifications: CriticalJustification[];
};

export type SafetyEvaluateInput = {
  patientId: string;
  consultationId?: string | null;
  cie10CodeId?: string | null;
  diagnosis?: string;
  lines: Array<{
    lineIndex: number;
    displayLabel: string;
    drugPresentationId?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    route?: string;
    instructions?: string;
  }>;
};

/**
 * Replaceable provider contract.
 * Production default: HttpSafetyProvider → POST /prescriptions/safety-evaluate.
 */
export interface SafetyProvider {
  readonly id: string;
  evaluate(input: SafetyEvaluateInput): Promise<SafetyEvaluation>;
}

export const CRITICAL_REASON_CODES = [
  { code: "benefit_outweighs_risk", label: "Beneficio supera el riesgo" },
  { code: "no_alternative", label: "Sin alternativa terapéutica adecuada" },
  { code: "allergy_unconfirmed", label: "Alergia no confirmada / dudosa" },
  { code: "short_course_monitored", label: "Curso corto con monitoreo" },
  { code: "other", label: "Otro (especificar)" },
] as const;

export type CriticalReasonCode =
  (typeof CRITICAL_REASON_CODES)[number]["code"];

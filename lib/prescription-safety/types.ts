/**
 * Prescription Engine PR-4.1 — Clinical Safety Gate domain contracts.
 * Aligned with Phase A design. No clinical rule engine. No persistence.
 */

export type SafetySeverity = "INFO" | "WARNING" | "CRITICAL";

/** Presentation order only — never changes clinical severity. */
export type SafetyPriority = "HIGH" | "NORMAL" | "LOW";

/** Representation only — no confidence calculation in PR-4.1. */
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

export type IssueDecision =
  | "ready"
  | "ready_with_info_only"
  | "needs_ack"
  | "needs_justification";

/**
 * UX decision state derived from evaluation + doctor actions.
 * Informational only in PR-4.1 — never hard-blocks emission.
 */
export type DecisionState = {
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
  issueDecision: IssueDecision;
};

export type SafetyEvaluateInput = {
  patientId: string;
  consultationId?: string | null;
  diagnosis?: string;
  /** Opaque line snapshots for future engine; mock may ignore clinically. */
  lines: Array<{
    lineIndex: number;
    displayLabel: string;
    drugPresentationId?: string;
  }>;
};

/**
 * Replaceable provider contract.
 * Mock today → Backend Rule Engine tomorrow without changing UI components.
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

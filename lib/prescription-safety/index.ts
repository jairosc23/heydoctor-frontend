export type {
  SafetySeverity,
  SafetyPriority,
  SafetyConfidence,
  SafetyAlertFamily,
  SafetyAlertRequirement,
  SafetyAlert,
  SafetyRuleResult,
  SafetyEvaluation,
  WarningAcknowledgement,
  CriticalJustification,
  UxIssueDecision,
  IssueDecision,
  PersistedIssueDecision,
  ClinicalDecisionState,
  DecisionState,
  SafetyDecisionPayload,
  SafetyEvaluateInput,
  SafetyProvider,
  CriticalReasonCode,
} from "./types";
export { CRITICAL_REASON_CODES } from "./types";

export {
  aggregateAlerts,
  dedupeAlerts,
  sortAlerts,
  alertDedupeKey,
  severityRank,
  priorityRank,
} from "./aggregator";

export {
  emptyDecisionState,
  buildDecisionState,
  acknowledgeWarning,
  revokeWarningAck,
  upsertCriticalJustification,
  isJustificationComplete,
} from "./decision-state";

export { buildSafetyDecisionPayload } from "./safety-decision-payload";

export {
  MockSafetyProvider,
  createMockSafetyProvider,
  MOCK_SAFETY_SCENARIOS,
} from "./mock-provider";
export type { MockSafetyScenario } from "./mock-provider";

export {
  HttpSafetyProvider,
  createHttpSafetyProvider,
  buildSafetyEvaluateRequest,
} from "./http-provider";
export {
  createDefaultSafetyProvider,
  isSafetyMockEnabled,
} from "./default-provider";

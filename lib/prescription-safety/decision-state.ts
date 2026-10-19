/**
 * Clinical Decision State — pure derivation from evaluation + UX actions.
 * Never hard-blocks emission.
 * uxIssueDecision ≠ PersistedIssueDecision (BE audit).
 */

import type {
  ClinicalDecisionState,
  CriticalJustification,
  SafetyEvaluation,
  UxIssueDecision,
  WarningAcknowledgement,
} from "./types";
import { aggregateAlerts } from "./aggregator";

export function emptyDecisionState(): ClinicalDecisionState {
  return {
    evaluationId: null,
    acknowledgements: [],
    justifications: [],
    pendingWarningAcks: [],
    pendingCriticalJustifications: [],
    openInfoCount: 0,
    openWarningCount: 0,
    openCriticalCount: 0,
    readyToIssue: true,
    uxIssueDecision: "ready",
  };
}

export function buildDecisionState(input: {
  evaluation: SafetyEvaluation | null;
  acknowledgements: WarningAcknowledgement[];
  justifications: CriticalJustification[];
}): ClinicalDecisionState {
  if (!input.evaluation) return emptyDecisionState();

  const alerts = aggregateAlerts(input.evaluation.alerts);
  const acked = new Set(input.acknowledgements.map((a) => a.alertId));
  const justificationByAlert = new Map(
    input.justifications.map((j) => [j.alertId, j]),
  );

  const pendingWarningAcks = alerts
    .filter((a) => a.severity === "WARNING" && a.requires === "ack")
    .filter((a) => !acked.has(a.alertId))
    .map((a) => a.alertId);

  const pendingCriticalJustifications = alerts
    .filter((a) => a.severity === "CRITICAL" && a.requires === "justification")
    .filter((a) => !isJustificationComplete(justificationByAlert.get(a.alertId)))
    .map((a) => a.alertId);

  const openInfoCount = alerts.filter((a) => a.severity === "INFO").length;
  const openWarningCount = pendingWarningAcks.length;
  const openCriticalCount = pendingCriticalJustifications.length;

  let uxIssueDecision: UxIssueDecision = "ready";
  if (openCriticalCount > 0) {
    uxIssueDecision = "needs_justification";
  } else if (openWarningCount > 0) {
    uxIssueDecision = "needs_ack";
  } else if (openInfoCount > 0) {
    uxIssueDecision = "ready_with_info_only";
  }

  return {
    evaluationId: input.evaluation.evaluationId,
    acknowledgements: input.acknowledgements,
    justifications: input.justifications,
    pendingWarningAcks,
    pendingCriticalJustifications,
    openInfoCount,
    openWarningCount,
    openCriticalCount,
    readyToIssue: openWarningCount === 0 && openCriticalCount === 0,
    uxIssueDecision,
  };
}

export function acknowledgeWarning(
  acknowledgements: WarningAcknowledgement[],
  alertId: string,
  at: string = new Date().toISOString(),
): WarningAcknowledgement[] {
  if (acknowledgements.some((a) => a.alertId === alertId)) {
    return acknowledgements;
  }
  return [...acknowledgements, { alertId, acknowledgedAt: at }];
}

export function revokeWarningAck(
  acknowledgements: WarningAcknowledgement[],
  alertId: string,
): WarningAcknowledgement[] {
  return acknowledgements.filter((a) => a.alertId !== alertId);
}

export function upsertCriticalJustification(
  justifications: CriticalJustification[],
  next: CriticalJustification,
): CriticalJustification[] {
  const without = justifications.filter((j) => j.alertId !== next.alertId);
  return [...without, next];
}

export function isJustificationComplete(
  justification: CriticalJustification | undefined,
): boolean {
  if (!justification) return false;
  if (!justification.reasonCode.trim()) return false;
  if (justification.reasonCode === "other") {
    return justification.reasonText.trim().length > 0;
  }
  return true;
}

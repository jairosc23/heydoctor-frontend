/**
 * Maps FE ClinicalDecisionState → BE safetyDecision (PR-4.3 DTO).
 * Does not invent persisted issueDecision — BE derives that on persist.
 */

import type {
  ClinicalDecisionState,
  SafetyDecisionPayload,
} from "./types";

export function buildSafetyDecisionPayload(
  state: ClinicalDecisionState,
): SafetyDecisionPayload {
  return {
    evaluationId: state.evaluationId ?? undefined,
    acknowledgements: state.acknowledgements.map((a) => ({
      alertId: a.alertId,
      acknowledgedAt: a.acknowledgedAt,
    })),
    justifications: state.justifications.map((j) => ({
      alertId: j.alertId,
      reasonCode: j.reasonCode,
      reasonText: j.reasonText,
      justifiedAt: j.justifiedAt,
    })),
  };
}

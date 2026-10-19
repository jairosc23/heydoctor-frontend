import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  acknowledgeWarning,
  buildDecisionState,
  emptyDecisionState,
  isJustificationComplete,
  upsertCriticalJustification,
} from "./decision-state";
import type { SafetyEvaluation } from "./types";

function evaluationWith(
  alerts: SafetyEvaluation["alerts"],
): SafetyEvaluation {
  return {
    evaluationId: "e1",
    evaluatedAt: "2026-07-22T00:00:00.000Z",
    engineVersion: "test",
    patientId: "p1",
    alerts,
  };
}

describe("prescription-safety decision-state (PR-4.1)", () => {
  it("happy path ready when no alerts", () => {
    const state = buildDecisionState({
      evaluation: evaluationWith([]),
      acknowledgements: [],
      justifications: [],
    });
    assert.equal(state.readyToIssue, true);
    assert.equal(state.uxIssueDecision, "ready");
  });

  it("INFO only → ready_with_info_only without interaction", () => {
    const state = buildDecisionState({
      evaluation: evaluationWith([
        {
          alertId: "i1",
          ruleId: "R5",
          family: "incomplete_safety_context",
          severity: "INFO",
          priority: "LOW",
          confidence: "HIGH",
          message: "info",
          lineIndexes: [],
          source: "test",
          requires: "none",
          arrivedAt: 1,
        },
      ]),
      acknowledgements: [],
      justifications: [],
    });
    assert.equal(state.uxIssueDecision, "ready_with_info_only");
    assert.equal(state.readyToIssue, true);
    assert.equal(state.pendingWarningAcks.length, 0);
  });

  it("WARNING requires acknowledgement", () => {
    const evaluation = evaluationWith([
      {
        alertId: "w1",
        ruleId: "R3",
        family: "therapeutic_duplication",
        severity: "WARNING",
        priority: "NORMAL",
        confidence: "HIGH",
        message: "warn",
        lineIndexes: [0],
        source: "test",
        requires: "ack",
        arrivedAt: 1,
      },
    ]);
    const pending = buildDecisionState({
      evaluation,
      acknowledgements: [],
      justifications: [],
    });
    assert.equal(pending.uxIssueDecision, "needs_ack");
    assert.equal(pending.readyToIssue, false);

    const acks = acknowledgeWarning([], "w1", "2026-07-22T01:00:00.000Z");
    const done = buildDecisionState({
      evaluation,
      acknowledgements: acks,
      justifications: [],
    });
    assert.equal(done.uxIssueDecision, "ready");
    assert.equal(done.readyToIssue, true);
  });

  it("CRITICAL requires justification (never blocks conceptually)", () => {
    const evaluation = evaluationWith([
      {
        alertId: "c1",
        ruleId: "R1",
        family: "allergy_match",
        severity: "CRITICAL",
        priority: "HIGH",
        confidence: "HIGH",
        message: "crit",
        lineIndexes: [0],
        source: "test",
        requires: "justification",
        arrivedAt: 1,
      },
    ]);
    const pending = buildDecisionState({
      evaluation,
      acknowledgements: [],
      justifications: [],
    });
    assert.equal(pending.uxIssueDecision, "needs_justification");
    assert.equal(pending.readyToIssue, false);

    const incomplete = upsertCriticalJustification([], {
      alertId: "c1",
      reasonCode: "other",
      reasonText: "",
      justifiedAt: "2026-07-22T01:00:00.000Z",
    });
    assert.equal(isJustificationComplete(incomplete[0]), false);

    const complete = upsertCriticalJustification([], {
      alertId: "c1",
      reasonCode: "benefit_outweighs_risk",
      reasonText: "",
      justifiedAt: "2026-07-22T01:00:00.000Z",
    });
    assert.equal(isJustificationComplete(complete[0]), true);

    const stillPending = buildDecisionState({
      evaluation,
      acknowledgements: [],
      justifications: incomplete,
    });
    assert.equal(stillPending.pendingCriticalJustifications.length, 1);

    const done = buildDecisionState({
      evaluation,
      acknowledgements: [],
      justifications: complete,
    });
    assert.equal(done.pendingCriticalJustifications.length, 0);
    assert.equal(done.readyToIssue, true);
  });

  it("emptyDecisionState defaults", () => {
    const s = emptyDecisionState();
    assert.equal(s.readyToIssue, true);
    assert.equal(s.uxIssueDecision, "ready");
  });
});

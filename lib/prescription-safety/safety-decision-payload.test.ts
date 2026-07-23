import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDecisionState } from "./decision-state";
import { buildSafetyDecisionPayload } from "./safety-decision-payload";
import type { SafetyEvaluation } from "./types";

describe("buildSafetyDecisionPayload", () => {
  it("maps ClinicalDecisionState to BE safetyDecision without inventing persisted issueDecision", () => {
    const evaluation: SafetyEvaluation = {
      evaluationId: "eval-client-1",
      evaluatedAt: "2026-07-22T00:00:00.000Z",
      engineVersion: "safety-gate-rule-engine-v1",
      patientId: "p1",
      alerts: [
        {
          alertId: "w1",
          ruleId: "R3",
          family: "therapeutic_duplication",
          severity: "WARNING",
          priority: "NORMAL",
          confidence: "HIGH",
          message: "dup",
          lineIndexes: [0],
          source: "test",
          requires: "ack",
          arrivedAt: 1,
        },
      ],
    };

    const state = buildDecisionState({
      evaluation,
      acknowledgements: [
        { alertId: "w1", acknowledgedAt: "2026-07-22T01:00:00.000Z" },
      ],
      justifications: [],
    });

    assert.equal(state.uxIssueDecision, "ready");
    const payload = buildSafetyDecisionPayload(state);
    assert.equal(payload.evaluationId, "eval-client-1");
    assert.deepEqual(payload.acknowledgements, [
      { alertId: "w1", acknowledgedAt: "2026-07-22T01:00:00.000Z" },
    ]);
    assert.deepEqual(payload.justifications, []);
    assert.equal(
      Object.prototype.hasOwnProperty.call(payload, "issueDecision"),
      false,
    );
  });
});

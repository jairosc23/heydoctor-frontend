import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedHeartScoreCalculationEngineEnvelope } from "./governed-heart-score-calculation-engine-mapper";
describe("HEART Score", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedHeartScoreCalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "HEART Score", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "heart_score", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

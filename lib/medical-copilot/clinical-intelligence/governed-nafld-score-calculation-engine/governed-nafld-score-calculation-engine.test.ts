import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedNafldScoreCalculationEngineEnvelope } from "./governed-nafld-score-calculation-engine-mapper";
describe("NAFLD Score", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedNafldScoreCalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "NAFLD Score", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "nafld_score", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

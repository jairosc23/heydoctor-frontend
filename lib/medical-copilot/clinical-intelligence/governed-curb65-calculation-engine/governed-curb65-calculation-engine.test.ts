import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedCurb65CalculationEngineEnvelope } from "./governed-curb65-calculation-engine-mapper";
describe("CURB-65", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedCurb65CalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "CURB-65", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "curb65", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

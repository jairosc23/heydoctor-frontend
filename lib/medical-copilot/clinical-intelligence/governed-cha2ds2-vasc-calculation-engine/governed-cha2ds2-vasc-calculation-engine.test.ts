import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedCha2ds2VascCalculationEngineEnvelope } from "./governed-cha2ds2-vasc-calculation-engine-mapper";
describe("CHA2DS2-VASc", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedCha2ds2VascCalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "CHA2DS2-VASc", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "cha2ds2_vasc", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

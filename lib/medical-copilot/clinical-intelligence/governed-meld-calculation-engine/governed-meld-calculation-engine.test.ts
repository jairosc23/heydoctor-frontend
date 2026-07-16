import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedMeldCalculationEngineEnvelope } from "./governed-meld-calculation-engine-mapper";
describe("MELD", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedMeldCalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "MELD", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "meld", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedFraminghamCalculationEngineEnvelope } from "./governed-framingham-calculation-engine-mapper";
describe("Framingham", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedFraminghamCalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Framingham", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "framingham", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

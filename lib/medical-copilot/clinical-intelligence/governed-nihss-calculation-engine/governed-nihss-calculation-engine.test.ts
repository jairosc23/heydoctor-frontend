import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedNihssCalculationEngineEnvelope } from "./governed-nihss-calculation-engine-mapper";
describe("NIHSS", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedNihssCalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "NIHSS", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "nihss", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

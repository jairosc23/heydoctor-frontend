import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedNews2CalculationEngineEnvelope } from "./governed-news2-calculation-engine-mapper";
describe("NEWS2", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedNews2CalculationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "NEWS2", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "news2", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], formulaId: "BMI", resultValue: null, resultUnit: null, inputsUsed: [], applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

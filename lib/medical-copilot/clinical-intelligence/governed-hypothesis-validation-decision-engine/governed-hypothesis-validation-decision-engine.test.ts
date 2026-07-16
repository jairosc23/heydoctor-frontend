import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedHypothesisValidationEngineEnvelope } from "./governed-hypothesis-validation-decision-engine-mapper";
describe("Hypothesis Validation Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedHypothesisValidationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Hypothesis Validation Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "hypothesis_validation", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

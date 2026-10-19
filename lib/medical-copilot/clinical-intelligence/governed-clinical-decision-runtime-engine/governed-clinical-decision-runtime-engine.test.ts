import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalDecisionRuntimeEngineEnvelope } from "./governed-clinical-decision-runtime-engine-mapper";
describe("Clinical Decision Runtime", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedClinicalDecisionRuntimeEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Clinical Decision Runtime", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "clinical_decision_runtime", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

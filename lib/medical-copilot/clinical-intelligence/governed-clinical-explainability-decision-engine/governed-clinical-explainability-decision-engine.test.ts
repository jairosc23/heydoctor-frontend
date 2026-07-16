import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalExplainabilityEngineEnvelope } from "./governed-clinical-explainability-decision-engine-mapper";
describe("Clinical Explainability Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedClinicalExplainabilityEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Clinical Explainability Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "clinical_explainability", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

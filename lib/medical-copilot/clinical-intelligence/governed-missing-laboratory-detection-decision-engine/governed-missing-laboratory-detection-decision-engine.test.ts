import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedMissingLaboratoryDetectionEngineEnvelope } from "./governed-missing-laboratory-detection-decision-engine-mapper";
describe("Missing Laboratory Detection Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedMissingLaboratoryDetectionEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Missing Laboratory Detection Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "missing_laboratory_detection", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

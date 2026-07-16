import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedClinicalConflictDetectionEngineEnvelope } from "./governed-clinical-conflict-detection-decision-engine-mapper";
describe("Clinical Conflict Detection Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedClinicalConflictDetectionEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Clinical Conflict Detection Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "clinical_conflict_detection", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

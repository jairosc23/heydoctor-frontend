import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedPhysicianReviewPreparationEngineEnvelope } from "./governed-physician-review-preparation-decision-engine-mapper";
describe("Physician Review Preparation Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedPhysicianReviewPreparationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Physician Review Preparation Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "physician_review_preparation", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

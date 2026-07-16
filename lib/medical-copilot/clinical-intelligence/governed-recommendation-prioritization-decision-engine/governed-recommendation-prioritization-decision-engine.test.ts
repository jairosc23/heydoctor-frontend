import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedRecommendationPrioritizationEngineEnvelope } from "./governed-recommendation-prioritization-decision-engine-mapper";
describe("Recommendation Prioritization Engine", () => {
  it("maps envelope with HITL seals", () => {
    const mapped = mapGovernedRecommendationPrioritizationEngineEnvelope({ status: "ok", data: { status: "PROPOSED_FOR_PHYSICIAN_REVIEW", title: "Recommendation Prioritization Engine", applicableCount: 1, entries: [{ entryId: "e1", entryTitle: "Entry", domain: "recommendation_prioritization", topic: "t", summary: "s", explanation: "x", evidenceRefs: ["medical_copilot_session"], decisionRole: "runtime", applicability: "APPLICABLE", confidence: "medium" }], enginesPresent: [], governance: { requiresPhysicianReview: true, usesLlm: false } } });
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.writesEmr, false);
    assert.equal(mapped!.entries.length, 1);
  });
});

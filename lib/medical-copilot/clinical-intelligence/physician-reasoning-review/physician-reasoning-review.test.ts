import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REASONING_REVIEW_GOVERNANCE, type PhysicianReasoningReview } from "./physician-reasoning-review";
import { mapPhysicianReasoningReview, mapPhysicianReasoningReviewEnvelope } from "./physician-reasoning-review-mapper";
describe("AI-84 PhysicianReasoningReview mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianReasoningReview = {
      physicianReasoningReviewId: "id1", providerId: "openai", reviewSlots: [], governance: { ...PHYSICIAN_REASONING_REVIEW_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        reasoningQualityEngineId: "x",
        reviewSessionId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapPhysicianReasoningReviewEnvelope({ physicianReasoningReview: { source: "physician_reasoning_review", builderVersion: "1.0.0", physicianReasoningReview: model, governance: { ...PHYSICIAN_REASONING_REVIEW_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianReasoningReview(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE, type PhysicianReviewSummary } from "./physician-review-summary";
import { mapPhysicianReviewSummary, mapPhysicianReviewSummaryEnvelope } from "./physician-review-summary-mapper";

describe("AI-34 PhysicianReviewSummary mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianReviewSummary = {
      reviewSummaryId: "id1",
      providerId: "openai",
      summarySlots: [],
      governance: { ...PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        validationWorkspaceId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianReviewSummaryEnvelope({
      reviewSummary: {
        source: "physician_review_summary",
        builderVersion: "1.0.0",
        reviewSummary: model,
        governance: { ...PHYSICIAN_REVIEW_SUMMARY_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianReviewSummary(null), null);
  });
});

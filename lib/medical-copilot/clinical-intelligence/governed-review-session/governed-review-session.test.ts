import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REVIEW_SESSION_GOVERNANCE, type GovernedReviewSession } from "./governed-review-session";
import { mapGovernedReviewSession, mapGovernedReviewSessionEnvelope } from "./governed-review-session-mapper";

describe("AI-40 GovernedReviewSession mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedReviewSession = {
      reviewSessionId: "id1",
      providerId: "openai",
      sessionSlots: [],
      governance: { ...GOVERNED_REVIEW_SESSION_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        physicianReviewPackageId: "x",
        checklistWorkspaceId: "x",
        reviewTimelineId: "x",
        reviewNavigationId: "x",
        reviewDashboardId: "x",
        reviewSummaryId: "x",
        validationWorkspaceId: "x",
        sessionPackageId: "x",
        workspaceId: "x",
        reviewWorkspaceV2Id: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedReviewSessionEnvelope({
      reviewSession: {
        source: "governed_review_session",
        builderVersion: "1.0.0",
        reviewSession: model,
        governance: { ...GOVERNED_REVIEW_SESSION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedReviewSession(null), null);
  });
});

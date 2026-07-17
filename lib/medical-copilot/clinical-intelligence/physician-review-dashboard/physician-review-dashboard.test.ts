import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE, type PhysicianReviewDashboard } from "./physician-review-dashboard";
import { mapPhysicianReviewDashboard, mapPhysicianReviewDashboardEnvelope } from "./physician-review-dashboard-mapper";

describe("AI-39 PhysicianReviewDashboard mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianReviewDashboard = {
      reviewDashboardId: "id1",
      providerId: "openai",
      dashboardSlots: [],
      governance: { ...PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        checklistWorkspaceId: "x",
        reviewTimelineId: "x",
        reviewNavigationId: "x",
        reviewSummaryId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianReviewDashboardEnvelope({
      reviewDashboard: {
        source: "physician_review_dashboard",
        builderVersion: "1.0.0",
        reviewDashboard: model,
        governance: { ...PHYSICIAN_REVIEW_DASHBOARD_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianReviewDashboard(null), null);
  });
});

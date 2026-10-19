import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE, type PhysicianReviewWorkspaceV2 } from "./physician-review-workspace-v2";
import { mapPhysicianReviewWorkspaceV2, mapPhysicianReviewWorkspaceV2Envelope } from "./physician-review-workspace-v2-mapper";

describe("AI-29 PhysicianReviewWorkspaceV2 mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianReviewWorkspaceV2 = {
      reviewWorkspaceV2Id: "id1",
      providerId: "openai",
      reviewViewSlots: [],
      governance: { ...PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        workspaceId: "x",
        evidenceWorkspaceId: "x",
        gapAnalyzerId: "x",
        priorityWorkspaceId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianReviewWorkspaceV2Envelope({
      reviewWorkspaceV2: {
        source: "physician_review_workspace_v2",
        builderVersion: "1.0.0",
        reviewWorkspaceV2: model,
        governance: { ...PHYSICIAN_REVIEW_WORKSPACE_V2_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianReviewWorkspaceV2(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE, type DifferentialReviewWorkspace } from "./differential-review-workspace";
import { mapDifferentialReviewWorkspace, mapDifferentialReviewWorkspaceEnvelope } from "./differential-review-workspace-mapper";

describe("AI-47 DifferentialReviewWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: DifferentialReviewWorkspace = {
      differentialReviewWorkspaceId: "id1",
      providerId: "openai",
      differentialReviewSlots: [],
      governance: { ...DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        differentialId: "x",
        evidenceMappingId: "x",
        confidenceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapDifferentialReviewWorkspaceEnvelope({
      differentialReviewWorkspace: {
        source: "differential_review_workspace",
        builderVersion: "1.0.0",
        differentialReviewWorkspace: model,
        governance: { ...DIFFERENTIAL_REVIEW_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapDifferentialReviewWorkspace(null), null);
  });
});

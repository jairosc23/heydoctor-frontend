import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PHYSICIAN_REVIEW_PREP_GOVERNANCE,
  type GovernedPhysicianReviewPrep,
} from "./governed-physician-review-prep";
import {
  mapGovernedPhysicianReviewPrep,
  mapGovernedPhysicianReviewPrepEnvelope,
} from "./governed-physician-review-prep-mapper";

describe("AI-14 GovernedPhysicianReviewPrep mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedPhysicianReviewPrep = {
      reviewPrepId: "id_empty",
      providerId: "noop",
      reviewItems: [],
      governance: { ...PHYSICIAN_REVIEW_PREP_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        payloadId: "x",
        invocationId: "x",
        normalizedId: "x",
        outputId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedPhysicianReviewPrepEnvelope({
      reviewPrep: {
        source: "governed_physician_review_prep",
        builderVersion: "1.0.0",
        reviewPrep: model,
        governance: { ...PHYSICIAN_REVIEW_PREP_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.reviewPrep.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.reviewPrep).sort().join(","),
      ["reviewPrepId", "governance", "metadata", "providerId", "reviewItems"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedPhysicianReviewPrep(null), null);
    assert.equal(mapGovernedPhysicianReviewPrep({ providerId: "openai" }), null);
  });
});

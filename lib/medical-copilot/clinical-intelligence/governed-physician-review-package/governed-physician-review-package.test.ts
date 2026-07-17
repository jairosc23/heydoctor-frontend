import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE, type GovernedPhysicianReviewPackage } from "./governed-physician-review-package";
import { mapGovernedPhysicianReviewPackage, mapGovernedPhysicianReviewPackageEnvelope } from "./governed-physician-review-package-mapper";

describe("AI-35 GovernedPhysicianReviewPackage mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedPhysicianReviewPackage = {
      physicianReviewPackageId: "id1",
      providerId: "openai",
      packageSlots: [],
      governance: { ...GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        reviewDatasetId: "x",
        checklistId: "x",
        validationWorkspaceId: "x",
        reviewSummaryId: "x",
        sessionPackageId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        reviewId: "x",
        caseId: "x",
        workspaceId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedPhysicianReviewPackageEnvelope({
      physicianReviewPackage: {
        source: "governed_physician_review_package",
        builderVersion: "1.0.0",
        physicianReviewPackage: model,
        governance: { ...GOVERNED_PHYSICIAN_REVIEW_PACKAGE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedPhysicianReviewPackage(null), null);
  });
});

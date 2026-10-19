import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REVIEW_NAVIGATION_GOVERNANCE, type ClinicalReviewNavigation } from "./clinical-review-navigation";
import { mapClinicalReviewNavigation, mapClinicalReviewNavigationEnvelope } from "./clinical-review-navigation-mapper";

describe("AI-38 ClinicalReviewNavigation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReviewNavigation = {
      reviewNavigationId: "id1",
      providerId: "openai",
      navigationSlots: [],
      governance: { ...CLINICAL_REVIEW_NAVIGATION_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        reviewTimelineId: "x",
        checklistWorkspaceId: "x",
        validationWorkspaceId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalReviewNavigationEnvelope({
      reviewNavigation: {
        source: "clinical_review_navigation",
        builderVersion: "1.0.0",
        reviewNavigation: model,
        governance: { ...CLINICAL_REVIEW_NAVIGATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReviewNavigation(null), null);
  });
});

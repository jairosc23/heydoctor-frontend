import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REVIEW_TIMELINE_GOVERNANCE, type ClinicalReviewTimeline } from "./clinical-review-timeline";
import { mapClinicalReviewTimeline, mapClinicalReviewTimelineEnvelope } from "./clinical-review-timeline-mapper";

describe("AI-37 ClinicalReviewTimeline mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReviewTimeline = {
      reviewTimelineId: "id1",
      providerId: "openai",
      timelineSlots: [],
      governance: { ...CLINICAL_REVIEW_TIMELINE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        physicianReviewPackageId: "x",
        validationWorkspaceId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalReviewTimelineEnvelope({
      reviewTimeline: {
        source: "clinical_review_timeline",
        builderVersion: "1.0.0",
        reviewTimeline: model,
        governance: { ...CLINICAL_REVIEW_TIMELINE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReviewTimeline(null), null);
  });
});

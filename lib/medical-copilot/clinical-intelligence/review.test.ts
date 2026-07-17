import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_REVIEW_GOVERNANCE,
  type ClinicalReview,
} from "./review";
import { mapReview, mapReviewEnvelope } from "./review-mapper";

describe("CI-7 Clinical Review mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const review: ClinicalReview = {
      snapshotId: "snap-1",
      reviewItems: [
        {
          id: "ri1",
          layer: "findings",
          sourceId: "f1",
          category: "workspace",
          summary: "Finding one",
        },
      ],
      governance: { ...CLINICAL_REVIEW_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        engineVersion: "1.0.0",
        status: "partial",
        itemCount: 1,
      },
    };

    const mapped = mapReviewEnvelope({
      review: {
        source: "governed_clinical_review_engine",
        engineVersion: "1.0.0",
        review,
        governance: { ...CLINICAL_REVIEW_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.review.snapshotId, "snap-1");
    assert.equal(mapped.review.reviewItems.length, 1);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid review payloads", () => {
    assert.equal(mapReview(null), null);
    assert.equal(mapReview({ snapshotId: "x" }), null);
  });
});

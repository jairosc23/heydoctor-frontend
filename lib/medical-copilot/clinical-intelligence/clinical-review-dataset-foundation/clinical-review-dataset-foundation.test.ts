import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REVIEW_DATASET_GOVERNANCE, type ClinicalReviewDatasetFoundation } from "./clinical-review-dataset-foundation";
import { mapClinicalReviewDatasetFoundation, mapClinicalReviewDatasetFoundationEnvelope } from "./clinical-review-dataset-foundation-mapper";

describe("AI-31 ClinicalReviewDatasetFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReviewDatasetFoundation = {
      reviewDatasetId: "id1",
      providerId: "openai",
      datasetSlots: [],
      governance: { ...CLINICAL_REVIEW_DATASET_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        sessionPackageId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalReviewDatasetFoundationEnvelope({
      reviewDataset: {
        source: "clinical_review_dataset_foundation",
        builderVersion: "1.0.0",
        reviewDataset: model,
        governance: { ...CLINICAL_REVIEW_DATASET_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReviewDatasetFoundation(null), null);
  });
});

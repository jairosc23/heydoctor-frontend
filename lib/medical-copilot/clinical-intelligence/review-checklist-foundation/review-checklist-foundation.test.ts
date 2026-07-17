import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REVIEW_CHECKLIST_GOVERNANCE, type ReviewChecklistFoundation } from "./review-checklist-foundation";
import { mapReviewChecklistFoundation, mapReviewChecklistFoundationEnvelope } from "./review-checklist-foundation-mapper";

describe("AI-32 ReviewChecklistFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReviewChecklistFoundation = {
      checklistId: "id1",
      providerId: "openai",
      checklistSlots: [],
      governance: { ...REVIEW_CHECKLIST_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        reviewDatasetId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapReviewChecklistFoundationEnvelope({
      checklist: {
        source: "review_checklist_foundation",
        builderVersion: "1.0.0",
        checklist: model,
        governance: { ...REVIEW_CHECKLIST_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReviewChecklistFoundation(null), null);
  });
});

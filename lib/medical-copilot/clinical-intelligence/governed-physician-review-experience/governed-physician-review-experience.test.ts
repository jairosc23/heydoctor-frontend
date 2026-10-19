import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE, type GovernedPhysicianReviewExperience } from "./governed-physician-review-experience";
import { mapGovernedPhysicianReviewExperience, mapGovernedPhysicianReviewExperienceEnvelope } from "./governed-physician-review-experience-mapper";

describe("AI-20 GovernedPhysicianReviewExperience mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedPhysicianReviewExperience = {
      reviewExperienceId: "id1",
      providerId: "openai",
      experienceSlots: [],
      governance: { ...PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        assemblyId: "x",
        translationId: "x",
        providerExecutionId: "x",
        processedId: "x",
        decisionState: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedPhysicianReviewExperienceEnvelope({
      reviewExperience: {
        source: "governed_physician_review_experience",
        builderVersion: "1.0.0",
        reviewExperience: model,
        governance: { ...PHYSICIAN_REVIEW_EXPERIENCE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedPhysicianReviewExperience(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REASONING_PREPARATION_GOVERNANCE, type PhysicianReasoningPreparation } from "./physician-reasoning-preparation";
import { mapPhysicianReasoningPreparation, mapPhysicianReasoningPreparationEnvelope } from "./physician-reasoning-preparation-mapper";

describe("AI-49 PhysicianReasoningPreparation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianReasoningPreparation = {
      physicianReasoningPreparationId: "id1",
      providerId: "openai",
      preparationSlots: [],
      governance: { ...PHYSICIAN_REASONING_PREPARATION_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        clinicalReasoningWorkspaceId: "x",
        differentialReviewWorkspaceId: "x",
        evidenceCompletenessWorkspaceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianReasoningPreparationEnvelope({
      reasoningPreparation: {
        source: "physician_reasoning_preparation",
        builderVersion: "1.0.0",
        reasoningPreparation: model,
        governance: { ...PHYSICIAN_REASONING_PREPARATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianReasoningPreparation(null), null);
  });
});

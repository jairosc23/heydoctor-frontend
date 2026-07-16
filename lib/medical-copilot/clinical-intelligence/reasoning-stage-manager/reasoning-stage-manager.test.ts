import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_STAGE_MANAGER_GOVERNANCE, type ReasoningStageManager } from "./reasoning-stage-manager";
import { mapReasoningStageManager, mapReasoningStageManagerEnvelope } from "./reasoning-stage-manager-mapper";
describe("AI-66 ReasoningStageManager mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReasoningStageManager = {
      reasoningStageManagerId: "id1", providerId: "openai", stageSlots: [], governance: { ...REASONING_STAGE_MANAGER_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningEngineFoundationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapReasoningStageManagerEnvelope({ reasoningStageManager: { source: "reasoning_stage_manager", builderVersion: "1.0.0", reasoningStageManager: model, governance: { ...REASONING_STAGE_MANAGER_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReasoningStageManager(null), null);
  });
});

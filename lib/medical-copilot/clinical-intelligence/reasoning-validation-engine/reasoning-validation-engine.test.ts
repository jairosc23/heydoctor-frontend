import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_VALIDATION_ENGINE_GOVERNANCE, type ReasoningValidationEngine } from "./reasoning-validation-engine";
import { mapReasoningValidationEngine, mapReasoningValidationEngineEnvelope } from "./reasoning-validation-engine-mapper";
describe("AI-68 ReasoningValidationEngine mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReasoningValidationEngine = {
      reasoningValidationEngineId: "id1", providerId: "openai", validationSlots: [], governance: { ...REASONING_VALIDATION_ENGINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        reasoningStateMachineId: "x",
        clinicalReasoningInputPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapReasoningValidationEngineEnvelope({ reasoningValidationEngine: { source: "reasoning_validation_engine", builderVersion: "1.0.0", reasoningValidationEngine: model, governance: { ...REASONING_VALIDATION_ENGINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReasoningValidationEngine(null), null);
  });
});

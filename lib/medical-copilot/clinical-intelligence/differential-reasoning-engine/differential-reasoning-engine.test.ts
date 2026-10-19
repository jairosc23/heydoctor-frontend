import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIFFERENTIAL_REASONING_ENGINE_GOVERNANCE, type DifferentialReasoningEngine } from "./differential-reasoning-engine";
import { mapDifferentialReasoningEngine, mapDifferentialReasoningEngineEnvelope } from "./differential-reasoning-engine-mapper";
describe("AI-77 DifferentialReasoningEngine mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: DifferentialReasoningEngine = {
      differentialReasoningEngineId: "id1", providerId: "openai", differentialSlots: [], governance: { ...DIFFERENTIAL_REASONING_ENGINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningOrchestratorId: "x",
        differentialId: "x",
        evidenceMappingId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapDifferentialReasoningEngineEnvelope({ differentialReasoningEngine: { source: "differential_reasoning_engine", builderVersion: "1.0.0", differentialReasoningEngine: model, governance: { ...DIFFERENTIAL_REASONING_ENGINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapDifferentialReasoningEngine(null), null);
  });
});

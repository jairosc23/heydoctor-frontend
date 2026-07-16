import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REASONING_OUTPUT_GOVERNANCE, type GovernedReasoningOutput } from "./governed-reasoning-output";
import { mapGovernedReasoningOutput, mapGovernedReasoningOutputEnvelope } from "./governed-reasoning-output-mapper";
describe("AI-80 GovernedReasoningOutput mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedReasoningOutput = {
      governedReasoningOutputId: "id1", providerId: "openai", outputSlots: [], governance: { ...GOVERNED_REASONING_OUTPUT_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalConsistencyEngineId: "x",
        clinicalReasoningTraceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedReasoningOutputEnvelope({ governedReasoningOutput: { source: "governed_reasoning_output", builderVersion: "1.0.0", governedReasoningOutput: model, governance: { ...GOVERNED_REASONING_OUTPUT_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedReasoningOutput(null), null);
  });
});

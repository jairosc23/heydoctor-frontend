import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REASONING_RUNTIME_GOVERNANCE, type GovernedReasoningRuntime } from "./governed-reasoning-runtime";
import { mapGovernedReasoningRuntime, mapGovernedReasoningRuntimeEnvelope } from "./governed-reasoning-runtime-mapper";
describe("AI-64 GovernedReasoningRuntime mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedReasoningRuntime = {
      governedReasoningRuntimeId: "id1", providerId: "openai", runtimeSlots: [], governance: { ...GOVERNED_REASONING_RUNTIME_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        reasoningExecutionContextId: "x",
        governedReasoningPreparationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedReasoningRuntimeEnvelope({ governedReasoningRuntime: { source: "governed_reasoning_runtime", builderVersion: "1.0.0", governedReasoningRuntime: model, governance: { ...GOVERNED_REASONING_RUNTIME_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedReasoningRuntime(null), null);
  });
});

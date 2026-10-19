import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_EXECUTION_CONTEXT_GOVERNANCE, type ReasoningExecutionContext } from "./reasoning-execution-context";
import { mapReasoningExecutionContext, mapReasoningExecutionContextEnvelope } from "./reasoning-execution-context-mapper";
describe("AI-63 ReasoningExecutionContext mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReasoningExecutionContext = {
      reasoningExecutionContextId: "id1", providerId: "openai", executionContextSlots: [], governance: { ...REASONING_EXECUTION_CONTEXT_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        reasoningRulePipelineId: "x",
        clinicalReasoningContextId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapReasoningExecutionContextEnvelope({ reasoningExecutionContext: { source: "reasoning_execution_context", builderVersion: "1.0.0", reasoningExecutionContext: model, governance: { ...REASONING_EXECUTION_CONTEXT_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReasoningExecutionContext(null), null);
  });
});

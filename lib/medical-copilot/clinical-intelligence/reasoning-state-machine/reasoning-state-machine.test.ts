import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_STATE_MACHINE_GOVERNANCE, type ReasoningStateMachine } from "./reasoning-state-machine";
import { mapReasoningStateMachine, mapReasoningStateMachineEnvelope } from "./reasoning-state-machine-mapper";
describe("AI-67 ReasoningStateMachine mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReasoningStateMachine = {
      reasoningStateMachineId: "id1", providerId: "openai", stateSlots: [], governance: { ...REASONING_STATE_MACHINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        reasoningStageManagerId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapReasoningStateMachineEnvelope({ reasoningStateMachine: { source: "reasoning_state_machine", builderVersion: "1.0.0", reasoningStateMachine: model, governance: { ...REASONING_STATE_MACHINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReasoningStateMachine(null), null);
  });
});

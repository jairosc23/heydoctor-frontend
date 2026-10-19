import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REASONING_SESSION_GOVERNANCE, type GovernedReasoningSession } from "./governed-reasoning-session";
import { mapGovernedReasoningSession, mapGovernedReasoningSessionEnvelope } from "./governed-reasoning-session-mapper";
describe("AI-69 GovernedReasoningSession mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedReasoningSession = {
      governedReasoningSessionId: "id1", providerId: "openai", sessionSlots: [], governance: { ...GOVERNED_REASONING_SESSION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        reasoningValidationEngineId: "x",
        governedReasoningRuntimeId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedReasoningSessionEnvelope({ governedReasoningSession: { source: "governed_reasoning_session", builderVersion: "1.0.0", governedReasoningSession: model, governance: { ...GOVERNED_REASONING_SESSION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedReasoningSession(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AI_INVOCATION_GOVERNANCE,
  type GovernedAIInvocationResult,
} from "./governed-ai-invocation";
import {
  mapGovernedAIInvocationResult,
  mapGovernedAIInvocationResultEnvelope,
} from "./governed-ai-invocation-mapper";

describe("AI-11 GovernedAIInvocationResult mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedAIInvocationResult = {
      invocationId: "id_empty",
      providerId: "noop",
      invocationSlots: [],
      governance: { ...AI_INVOCATION_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        payloadId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedAIInvocationResultEnvelope({
      invocation: {
        source: "governed_ai_invocation",
        builderVersion: "1.0.0",
        invocation: model,
        governance: { ...AI_INVOCATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.invocation.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.invocation).sort().join(","),
      ["invocationId", "governance", "metadata", "providerId", "invocationSlots"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedAIInvocationResult(null), null);
    assert.equal(mapGovernedAIInvocationResult({ providerId: "openai" }), null);
  });
});

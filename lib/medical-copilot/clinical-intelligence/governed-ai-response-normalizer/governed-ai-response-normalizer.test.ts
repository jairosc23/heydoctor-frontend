import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AI_RESPONSE_NORMALIZER_GOVERNANCE,
  type GovernedNormalizedAIResponse,
} from "./governed-ai-response-normalizer";
import {
  mapGovernedNormalizedAIResponse,
  mapGovernedNormalizedAIResponseEnvelope,
} from "./governed-ai-response-normalizer-mapper";

describe("AI-12 GovernedNormalizedAIResponse mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedNormalizedAIResponse = {
      normalizedId: "id_empty",
      providerId: "noop",
      normalizedSlots: [],
      governance: { ...AI_RESPONSE_NORMALIZER_GOVERNANCE },
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
        invocationId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedNormalizedAIResponseEnvelope({
      normalized: {
        source: "governed_ai_response_normalizer",
        builderVersion: "1.0.0",
        normalized: model,
        governance: { ...AI_RESPONSE_NORMALIZER_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.normalized.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.normalized).sort().join(","),
      ["normalizedId", "governance", "metadata", "providerId", "normalizedSlots"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedNormalizedAIResponse(null), null);
    assert.equal(mapGovernedNormalizedAIResponse({ providerId: "openai" }), null);
  });
});

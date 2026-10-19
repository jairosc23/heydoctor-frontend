import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AI_RESPONSE_PROCESSING_GOVERNANCE, type GovernedProcessedAIResponse } from "./governed-ai-response-processing";
import { mapGovernedProcessedAIResponse, mapGovernedProcessedAIResponseEnvelope } from "./governed-ai-response-processing-mapper";

describe("AI-19 GovernedProcessedAIResponse mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedProcessedAIResponse = {
      processedId: "id1",
      providerId: "openai",
      processedSlots: [],
      governance: { ...AI_RESPONSE_PROCESSING_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        assemblyId: "x",
        translationId: "x",
        providerExecutionId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedProcessedAIResponseEnvelope({
      processed: {
        source: "governed_ai_response_processing",
        builderVersion: "1.0.0",
        processed: model,
        governance: { ...AI_RESPONSE_PROCESSING_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedProcessedAIResponse(null), null);
  });
});

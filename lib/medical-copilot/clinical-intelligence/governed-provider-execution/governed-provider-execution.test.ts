import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROVIDER_EXECUTION_GOVERNANCE, type GovernedProviderExecutionResult } from "./governed-provider-execution";
import { mapGovernedProviderExecutionResult, mapGovernedProviderExecutionResultEnvelope } from "./governed-provider-execution-mapper";

describe("AI-18 GovernedProviderExecutionResult mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedProviderExecutionResult = {
      providerExecutionId: "id1",
      providerId: "openai",
      executionSlots: [],
      governance: { ...PROVIDER_EXECUTION_GOVERNANCE },
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
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedProviderExecutionResultEnvelope({
      providerExecution: {
        source: "governed_provider_execution",
        builderVersion: "1.0.0",
        providerExecution: model,
        governance: { ...PROVIDER_EXECUTION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedProviderExecutionResult(null), null);
  });
});

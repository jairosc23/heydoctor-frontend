import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EXECUTION_GOVERNANCE,
  type GovernedAIExecutionResult,
} from "./governed-ai-execution";
import {
  mapExecutionResult,
  mapGovernedAIExecutionEnvelope,
} from "./governed-ai-execution-mapper";

describe("AI-5 Governed AI Execution mapper", () => {
  it("maps execution envelope and preserves HITL governance", () => {
    const response: GovernedAIExecutionResult = {
      executionId: "gae_s1_c1_p1_plan-1_noop_empty",
      providerId: "noop",
      status: "empty",
      governance: { ...EXECUTION_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        planId: "plan-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        executionVersion: "1.0.0",
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedAIExecutionEnvelope({
      execution: {
        source: "governed_ai_execution",
        executionVersion: "1.0.0",
        response,
        governance: { ...EXECUTION_GOVERNANCE },
        reason: "gateway_accepted_empty_request",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.response.providerId, "noop");
    assert.equal(mapped.response.status, "empty");
    assert.equal(mapped.response.executionId, "gae_s1_c1_p1_plan-1_noop_empty");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.response).sort().join(","),
      ["executionId", "governance", "metadata", "providerId", "status"]
        .sort()
        .join(","),
    );
  });

  it("rejects invalid response payloads", () => {
    assert.equal(mapExecutionResult(null), null);
    assert.equal(mapExecutionResult({ providerId: "openai" }), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WORKFLOW_INTEGRATION_GOVERNANCE,
  type GovernedWorkflowIntegration,
} from "./governed-workflow-integration";
import {
  mapGovernedWorkflowIntegration,
  mapGovernedWorkflowIntegrationEnvelope,
} from "./governed-workflow-integration-mapper";

describe("AI-15 GovernedWorkflowIntegration mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedWorkflowIntegration = {
      integrationId: "id_empty",
      providerId: "noop",
      integrationSlots: [],
      governance: { ...WORKFLOW_INTEGRATION_GOVERNANCE },
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
        normalizedId: "x",
        outputId: "x",
        reviewPrepId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedWorkflowIntegrationEnvelope({
      integration: {
        source: "governed_workflow_integration",
        builderVersion: "1.0.0",
        integration: model,
        governance: { ...WORKFLOW_INTEGRATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.integration.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.integration).sort().join(","),
      ["integrationId", "governance", "metadata", "providerId", "integrationSlots"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedWorkflowIntegration(null), null);
    assert.equal(mapGovernedWorkflowIntegration({ providerId: "openai" }), null);
  });
});

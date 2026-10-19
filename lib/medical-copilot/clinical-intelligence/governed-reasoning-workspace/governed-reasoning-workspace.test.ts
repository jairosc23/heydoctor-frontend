import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REASONING_WORKSPACE_GOVERNANCE, type GovernedReasoningWorkspace } from "./governed-reasoning-workspace";
import { mapGovernedReasoningWorkspace, mapGovernedReasoningWorkspaceEnvelope } from "./governed-reasoning-workspace-mapper";

describe("AI-54 GovernedReasoningWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedReasoningWorkspace = {
      governedReasoningWorkspaceId: "id1",
      providerId: "openai",
      reasoningViewSlots: [],
      governance: { ...GOVERNED_REASONING_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        clinicalPatternWorkspaceId: "x",
        physicianReasoningPreparationId: "x",
        confidenceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedReasoningWorkspaceEnvelope({
      governedReasoningWorkspace: {
        source: "governed_reasoning_workspace",
        builderVersion: "1.0.0",
        governedReasoningWorkspace: model,
        governance: { ...GOVERNED_REASONING_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedReasoningWorkspace(null), null);
  });
});

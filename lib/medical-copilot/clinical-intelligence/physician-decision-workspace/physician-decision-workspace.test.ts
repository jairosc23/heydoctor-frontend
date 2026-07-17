import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE, type PhysicianDecisionWorkspace } from "./physician-decision-workspace";
import { mapPhysicianDecisionWorkspace, mapPhysicianDecisionWorkspaceEnvelope } from "./physician-decision-workspace-mapper";

describe("AI-25 PhysicianDecisionWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianDecisionWorkspace = {
      workspaceId: "id1",
      providerId: "openai",
      viewSlots: [],
      governance: { ...PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        contextId: "x",
        findingRefId: "x",
        insightRefId: "x",
        recommendationRefId: "x",
        reviewId: "x",
        caseId: "x",
        clinicalPlanId: "x",
        responseId: "x",
        differentialId: "x",
        evidenceMappingId: "x",
        confidenceId: "x",
        missingInformationId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianDecisionWorkspaceEnvelope({
      workspace: {
        source: "physician_decision_workspace",
        builderVersion: "1.0.0",
        workspace: model,
        governance: { ...PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianDecisionWorkspace(null), null);
  });
});

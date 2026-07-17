import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_WORKSPACE_GOVERNANCE, type ClinicalReasoningWorkspace } from "./clinical-reasoning-workspace";
import { mapClinicalReasoningWorkspace, mapClinicalReasoningWorkspaceEnvelope } from "./clinical-reasoning-workspace-mapper";

describe("AI-46 ClinicalReasoningWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningWorkspace = {
      clinicalReasoningWorkspaceId: "id1",
      providerId: "openai",
      reasoningSlots: [],
      governance: { ...CLINICAL_REASONING_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        assessmentPackageId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        confidenceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalReasoningWorkspaceEnvelope({
      reasoningWorkspace: {
        source: "clinical_reasoning_workspace",
        builderVersion: "1.0.0",
        reasoningWorkspace: model,
        governance: { ...CLINICAL_REASONING_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningWorkspace(null), null);
  });
});

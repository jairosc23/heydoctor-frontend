import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE, type ClinicalPriorityWorkspace } from "./clinical-priority-workspace";
import { mapClinicalPriorityWorkspace, mapClinicalPriorityWorkspaceEnvelope } from "./clinical-priority-workspace-mapper";

describe("AI-28 ClinicalPriorityWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalPriorityWorkspace = {
      priorityWorkspaceId: "id1",
      providerId: "openai",
      prioritySlots: [],
      governance: { ...CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        confidenceId: "x",
        evidenceWorkspaceId: "x",
        gapAnalyzerId: "x",
        documentaryPriority: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalPriorityWorkspaceEnvelope({
      priorityWorkspace: {
        source: "clinical_priority_workspace",
        builderVersion: "1.0.0",
        priorityWorkspace: model,
        governance: { ...CLINICAL_PRIORITY_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalPriorityWorkspace(null), null);
  });
});

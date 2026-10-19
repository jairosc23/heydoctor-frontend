import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE, type ClinicalValidationWorkspace } from "./clinical-validation-workspace";
import { mapClinicalValidationWorkspace, mapClinicalValidationWorkspaceEnvelope } from "./clinical-validation-workspace-mapper";

describe("AI-33 ClinicalValidationWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalValidationWorkspace = {
      validationWorkspaceId: "id1",
      providerId: "openai",
      validationSlots: [],
      governance: { ...CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        reviewDatasetId: "x",
        checklistId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalValidationWorkspaceEnvelope({
      validationWorkspace: {
        source: "clinical_validation_workspace",
        builderVersion: "1.0.0",
        validationWorkspace: model,
        governance: { ...CLINICAL_VALIDATION_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalValidationWorkspace(null), null);
  });
});

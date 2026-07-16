import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_READINESS_WORKSPACE_GOVERNANCE, type ClinicalReadinessWorkspace } from "./clinical-readiness-workspace";
import { mapClinicalReadinessWorkspace, mapClinicalReadinessWorkspaceEnvelope } from "./clinical-readiness-workspace-mapper";

describe("AI-44 ClinicalReadinessWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReadinessWorkspace = {
      readinessWorkspaceId: "id1",
      providerId: "openai",
      readinessSlots: [],
      governance: { ...CLINICAL_READINESS_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        completenessId: "x",
        confidenceId: "x",
        reviewSummaryId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalReadinessWorkspaceEnvelope({
      readinessWorkspace: {
        source: "clinical_readiness_workspace",
        builderVersion: "1.0.0",
        readinessWorkspace: model,
        governance: { ...CLINICAL_READINESS_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReadinessWorkspace(null), null);
  });
});

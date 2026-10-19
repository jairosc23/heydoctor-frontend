import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_HYPOTHESIS_WORKSPACE_GOVERNANCE, type ClinicalHypothesisWorkspace } from "./clinical-hypothesis-workspace";
import { mapClinicalHypothesisWorkspace, mapClinicalHypothesisWorkspaceEnvelope } from "./clinical-hypothesis-workspace-mapper";
describe("AI-81 ClinicalHypothesisWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalHypothesisWorkspace = {
      clinicalHypothesisWorkspaceId: "id1", providerId: "openai", hypothesisSlots: [], governance: { ...CLINICAL_HYPOTHESIS_WORKSPACE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedReasoningOutputId: "x",
        differentialReasoningEngineId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalHypothesisWorkspaceEnvelope({ clinicalHypothesisWorkspace: { source: "clinical_hypothesis_workspace", builderVersion: "1.0.0", clinicalHypothesisWorkspace: model, governance: { ...CLINICAL_HYPOTHESIS_WORKSPACE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalHypothesisWorkspace(null), null);
  });
});

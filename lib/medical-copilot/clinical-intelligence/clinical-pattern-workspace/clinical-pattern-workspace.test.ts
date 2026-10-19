import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_PATTERN_WORKSPACE_GOVERNANCE, type ClinicalPatternWorkspace } from "./clinical-pattern-workspace";
import { mapClinicalPatternWorkspace, mapClinicalPatternWorkspaceEnvelope } from "./clinical-pattern-workspace-mapper";

describe("AI-53 ClinicalPatternWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalPatternWorkspace = {
      clinicalPatternWorkspaceId: "id1",
      providerId: "openai",
      patternSlots: [],
      governance: { ...CLINICAL_PATTERN_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        evidenceCorrelationWorkspaceId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalPatternWorkspaceEnvelope({
      clinicalPatternWorkspace: {
        source: "clinical_pattern_workspace",
        builderVersion: "1.0.0",
        clinicalPatternWorkspace: model,
        governance: { ...CLINICAL_PATTERN_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalPatternWorkspace(null), null);
  });
});

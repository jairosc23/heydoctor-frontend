import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE, type EvidenceCompletenessWorkspace } from "./evidence-completeness-workspace";
import { mapEvidenceCompletenessWorkspace, mapEvidenceCompletenessWorkspaceEnvelope } from "./evidence-completeness-workspace-mapper";

describe("AI-48 EvidenceCompletenessWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: EvidenceCompletenessWorkspace = {
      evidenceCompletenessWorkspaceId: "id1",
      providerId: "openai",
      evidenceCompletenessSlots: [],
      governance: { ...EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        evidenceWorkspaceId: "x",
        gapAnalyzerId: "x",
        missingInformationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapEvidenceCompletenessWorkspaceEnvelope({
      evidenceCompletenessWorkspace: {
        source: "evidence_completeness_workspace",
        builderVersion: "1.0.0",
        evidenceCompletenessWorkspace: model,
        governance: { ...EVIDENCE_COMPLETENESS_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapEvidenceCompletenessWorkspace(null), null);
  });
});

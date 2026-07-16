import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE, type DiagnosticEvidenceWorkspace } from "./diagnostic-evidence-workspace";
import { mapDiagnosticEvidenceWorkspace, mapDiagnosticEvidenceWorkspaceEnvelope } from "./diagnostic-evidence-workspace-mapper";

describe("AI-26 DiagnosticEvidenceWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: DiagnosticEvidenceWorkspace = {
      evidenceWorkspaceId: "id1",
      providerId: "openai",
      evidenceViewSlots: [],
      governance: { ...DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        workspaceId: "x",
        evidenceMappingId: "x",
        findingRefId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapDiagnosticEvidenceWorkspaceEnvelope({
      evidenceWorkspace: {
        source: "diagnostic_evidence_workspace",
        builderVersion: "1.0.0",
        evidenceWorkspace: model,
        governance: { ...DIAGNOSTIC_EVIDENCE_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapDiagnosticEvidenceWorkspace(null), null);
  });
});

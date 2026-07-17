import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE, type EvidenceCorrelationWorkspace } from "./evidence-correlation-workspace";
import { mapEvidenceCorrelationWorkspace, mapEvidenceCorrelationWorkspaceEnvelope } from "./evidence-correlation-workspace-mapper";

describe("AI-52 EvidenceCorrelationWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: EvidenceCorrelationWorkspace = {
      evidenceCorrelationWorkspaceId: "id1",
      providerId: "openai",
      correlationSlots: [],
      governance: { ...EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        clinicalReasoningDatasetId: "x",
        evidenceMappingId: "x",
        evidenceWorkspaceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapEvidenceCorrelationWorkspaceEnvelope({
      evidenceCorrelationWorkspace: {
        source: "evidence_correlation_workspace",
        builderVersion: "1.0.0",
        evidenceCorrelationWorkspace: model,
        governance: { ...EVIDENCE_CORRELATION_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapEvidenceCorrelationWorkspace(null), null);
  });
});

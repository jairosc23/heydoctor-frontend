import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE, type EvidenceGraphWorkspace } from "./evidence-graph-workspace";
import { mapEvidenceGraphWorkspace, mapEvidenceGraphWorkspaceEnvelope } from "./evidence-graph-workspace-mapper";
describe("AI-57 EvidenceGraphWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: EvidenceGraphWorkspace = {
      evidenceGraphWorkspaceId: "id1", providerId: "openai", graphSlots: [], governance: { ...EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningContextId: "x",
        evidenceCorrelationWorkspaceId: "x",
        evidenceMappingId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapEvidenceGraphWorkspaceEnvelope({ evidenceGraphWorkspace: { source: "evidence_graph_workspace", builderVersion: "1.0.0", evidenceGraphWorkspace: model, governance: { ...EVIDENCE_GRAPH_WORKSPACE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapEvidenceGraphWorkspace(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVIDENCE_RANKING_WORKSPACE_GOVERNANCE, type EvidenceRankingWorkspace } from "./evidence-ranking-workspace";
import { mapEvidenceRankingWorkspace, mapEvidenceRankingWorkspaceEnvelope } from "./evidence-ranking-workspace-mapper";
describe("AI-82 EvidenceRankingWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: EvidenceRankingWorkspace = {
      evidenceRankingWorkspaceId: "id1", providerId: "openai", rankingSlots: [], governance: { ...EVIDENCE_RANKING_WORKSPACE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalHypothesisWorkspaceId: "x",
        evidenceReasoningEngineId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapEvidenceRankingWorkspaceEnvelope({ evidenceRankingWorkspace: { source: "evidence_ranking_workspace", builderVersion: "1.0.0", evidenceRankingWorkspace: model, governance: { ...EVIDENCE_RANKING_WORKSPACE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapEvidenceRankingWorkspace(null), null);
  });
});

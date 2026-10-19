import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_INTELLIGENCE_WORKSPACE_GOVERNANCE, type PhysicianIntelligenceWorkspace } from "./physician-intelligence-workspace";
import { mapPhysicianIntelligenceWorkspace, mapPhysicianIntelligenceWorkspaceEnvelope } from "./physician-intelligence-workspace-mapper";
describe("AI-91 PhysicianIntelligenceWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianIntelligenceWorkspace = {
      physicianIntelligenceWorkspaceId: "id1", providerId: "openai", workspaceSlots: [], governance: { ...PHYSICIAN_INTELLIGENCE_WORKSPACE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceRuntimeId: "x",
        physicianReasoningReviewId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapPhysicianIntelligenceWorkspaceEnvelope({ physicianIntelligenceWorkspace: { source: "physician_intelligence_workspace", builderVersion: "1.0.0", physicianIntelligenceWorkspace: model, governance: { ...PHYSICIAN_INTELLIGENCE_WORKSPACE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianIntelligenceWorkspace(null), null);
  });
});

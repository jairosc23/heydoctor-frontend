import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE, type PhysicianReviewChecklistWorkspace } from "./physician-review-checklist-workspace";
import { mapPhysicianReviewChecklistWorkspace, mapPhysicianReviewChecklistWorkspaceEnvelope } from "./physician-review-checklist-workspace-mapper";

describe("AI-36 PhysicianReviewChecklistWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianReviewChecklistWorkspace = {
      checklistWorkspaceId: "id1",
      providerId: "openai",
      checklistViewSlots: [],
      governance: { ...PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        physicianReviewPackageId: "x",
        checklistId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianReviewChecklistWorkspaceEnvelope({
      checklistWorkspace: {
        source: "physician_review_checklist_workspace",
        builderVersion: "1.0.0",
        checklistWorkspace: model,
        governance: { ...PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianReviewChecklistWorkspace(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_DRAFT_REVIEW_WORKSPACE_GOVERNANCE } from "./governed-draft-review-workspace";
import { mapGovernedDraftReviewWorkspaceEnvelope } from "./governed-draft-review-workspace-mapper";

describe("Phase 50 GovernedDraftReviewWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedDraftReviewWorkspaceEnvelope({
      documentationPackage: { status: "ok" },
      physicianInteractionWorkspace: { status: "ok" },
      governance: { ...GOVERNED_DRAFT_REVIEW_WORKSPACE_GOVERNANCE },
      reason: "governed_draft_review_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedDraftReviewWorkspaceEnvelope(null), null);
  });
});

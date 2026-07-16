import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_DRAFT_COMPARISON_WORKSPACE_GOVERNANCE } from "./governed-draft-comparison-workspace";
import { mapGovernedDraftComparisonWorkspaceEnvelope } from "./governed-draft-comparison-workspace-mapper";

describe("Phase 51 GovernedDraftComparisonWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedDraftComparisonWorkspaceEnvelope({
      draftReviewWorkspace: { status: "ok" },
      clinicalDocumentationPackage: { status: "ok" },
      governance: { ...GOVERNED_DRAFT_COMPARISON_WORKSPACE_GOVERNANCE },
      reason: "governed_draft_comparison_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedDraftComparisonWorkspaceEnvelope(null), null);
  });
});

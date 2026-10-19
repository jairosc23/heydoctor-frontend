import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_WORKSPACE_REVIEW_GOVERNANCE } from "./governed-clinical-workspace-review";
import { mapGovernedClinicalWorkspaceReviewEnvelope } from "./governed-clinical-workspace-review-mapper";

describe("Phase 30 GovernedClinicalWorkspaceReview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalWorkspaceReviewEnvelope({
      clinicalWorkspace: { status: "ok" },
      reviewSession: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_WORKSPACE_REVIEW_GOVERNANCE },
      reason: "governed_clinical_workspace_review_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 3);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalWorkspaceReviewEnvelope(null), null);
  });
});

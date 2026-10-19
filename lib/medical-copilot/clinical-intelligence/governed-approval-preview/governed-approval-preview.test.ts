import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_APPROVAL_PREVIEW_GOVERNANCE } from "./governed-approval-preview";
import { mapGovernedApprovalPreviewEnvelope } from "./governed-approval-preview-mapper";

describe("Phase 53 GovernedApprovalPreview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedApprovalPreviewEnvelope({
      validationWorkspace: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      governance: { ...GOVERNED_APPROVAL_PREVIEW_GOVERNANCE },
      reason: "governed_approval_preview_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedApprovalPreviewEnvelope(null), null);
  });
});

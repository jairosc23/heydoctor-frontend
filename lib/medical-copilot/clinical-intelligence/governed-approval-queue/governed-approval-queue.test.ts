import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_APPROVAL_QUEUE_GOVERNANCE } from "./governed-approval-queue";
import { mapGovernedApprovalQueueEnvelope } from "./governed-approval-queue-mapper";

describe("Phase 54 GovernedApprovalQueue mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedApprovalQueueEnvelope({
      approvalPreview: { status: "ok" },
      consultationPackage: { status: "ok" },
      governance: { ...GOVERNED_APPROVAL_QUEUE_GOVERNANCE },
      reason: "governed_approval_queue_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedApprovalQueueEnvelope(null), null);
  });
});

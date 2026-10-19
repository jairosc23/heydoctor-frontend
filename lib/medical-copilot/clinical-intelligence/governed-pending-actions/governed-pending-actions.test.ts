import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PENDING_ACTIONS_GOVERNANCE } from "./governed-pending-actions";
import { mapGovernedPendingActionsEnvelope } from "./governed-pending-actions-mapper";

describe("Phase 55 GovernedPendingActions mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPendingActionsEnvelope({
      approvalQueue: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      governance: { ...GOVERNED_PENDING_ACTIONS_GOVERNANCE },
      reason: "governed_pending_actions_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPendingActionsEnvelope(null), null);
  });
});

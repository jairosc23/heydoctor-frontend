import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_ACTIVATION_WORKSPACE_GOVERNANCE } from "./governed-physician-activation-workspace";
import { mapGovernedPhysicianActivationWorkspaceEnvelope } from "./governed-physician-activation-workspace-mapper";

describe("Phase 63 GovernedPhysicianActivationWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianActivationWorkspaceEnvelope({
      activationNavigation: { status: "ok" },
      physicianDashboard: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_ACTIVATION_WORKSPACE_GOVERNANCE },
      reason: "governed_physician_activation_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPhysicianActivationWorkspaceEnvelope(null), null);
  });
});

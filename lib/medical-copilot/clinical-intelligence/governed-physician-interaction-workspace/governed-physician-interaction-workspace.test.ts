import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_INTERACTION_WORKSPACE_GOVERNANCE } from "./governed-physician-interaction-workspace";
import { mapGovernedPhysicianInteractionWorkspaceEnvelope } from "./governed-physician-interaction-workspace-mapper";

describe("Phase 49 GovernedPhysicianInteractionWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianInteractionWorkspaceEnvelope({
      clinicalExperiencePackage: { status: "ok" },
      physicianDashboard: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_INTERACTION_WORKSPACE_GOVERNANCE },
      reason: "governed_physician_interaction_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPhysicianInteractionWorkspaceEnvelope(null), null);
  });
});

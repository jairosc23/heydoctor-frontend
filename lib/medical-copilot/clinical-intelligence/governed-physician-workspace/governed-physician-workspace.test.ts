import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE } from "./governed-physician-workspace";
import { mapGovernedPhysicianWorkspaceEnvelope } from "./governed-physician-workspace-mapper";

describe("Phase 19 GovernedPhysicianWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianWorkspaceEnvelope({
      clinicalEncounter: { status: "ok" },
      physicianDecisionWorkspace: { status: "ok" },
      reviewSession: { status: "ok" },
      clinicalContext: { status: "ok" },
      clinicalPlan: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE },
      reason: "governed_physician_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 5);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedPhysicianWorkspaceEnvelope(null), null);
  });
});

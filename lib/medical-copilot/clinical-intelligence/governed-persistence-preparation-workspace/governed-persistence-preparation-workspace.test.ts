import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_PREPARATION_WORKSPACE_GOVERNANCE } from "./governed-persistence-preparation-workspace";
import { mapGovernedPersistencePreparationWorkspaceEnvelope } from "./governed-persistence-preparation-workspace-mapper";

describe("Phase 69 GovernedPersistencePreparationWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistencePreparationWorkspaceEnvelope({
      clinicalActivationPackage: { status: "ok" },
      physicianRuntimePackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_PREPARATION_WORKSPACE_GOVERNANCE },
      reason: "governed_persistence_preparation_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistencePreparationWorkspaceEnvelope(null), null);
  });
});

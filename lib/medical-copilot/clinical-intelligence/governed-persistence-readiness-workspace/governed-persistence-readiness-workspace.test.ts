import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_WORKSPACE_GOVERNANCE } from "./governed-persistence-readiness-workspace";
import { mapGovernedPersistenceReadinessWorkspaceEnvelope } from "./governed-persistence-readiness-workspace-mapper";

describe("Phase 79 GovernedPersistenceReadinessWorkspace mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessWorkspaceEnvelope({
      persistencePackage: { status: "ok" },
      clinicalActivationPackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_WORKSPACE_GOVERNANCE },
      reason: "governed_persistence_readiness_workspace_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessWorkspaceEnvelope(null), null);
  });
});

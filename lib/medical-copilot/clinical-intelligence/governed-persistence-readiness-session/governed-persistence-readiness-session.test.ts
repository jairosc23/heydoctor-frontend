import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_SESSION_GOVERNANCE } from "./governed-persistence-readiness-session";
import { mapGovernedPersistenceReadinessSessionEnvelope } from "./governed-persistence-readiness-session-mapper";

describe("Phase 83 GovernedPersistenceReadinessSession mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessSessionEnvelope({
      persistenceReadinessDashboard: { status: "ok" },
      persistenceSession: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_SESSION_GOVERNANCE },
      reason: "governed_persistence_readiness_session_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessSessionEnvelope(null), null);
  });
});

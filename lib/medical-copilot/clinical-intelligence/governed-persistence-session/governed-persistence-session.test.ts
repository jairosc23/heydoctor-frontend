import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_SESSION_GOVERNANCE } from "./governed-persistence-session";
import { mapGovernedPersistenceSessionEnvelope } from "./governed-persistence-session-mapper";

describe("Phase 74 GovernedPersistenceSession mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceSessionEnvelope({
      persistenceDashboard: { status: "ok" },
      clinicalActivationSession: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_SESSION_GOVERNANCE },
      reason: "governed_persistence_session_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceSessionEnvelope(null), null);
  });
});

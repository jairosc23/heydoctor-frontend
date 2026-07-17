import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_NAVIGATION_GOVERNANCE } from "./governed-persistence-navigation";
import { mapGovernedPersistenceNavigationEnvelope } from "./governed-persistence-navigation-mapper";

describe("Phase 72 GovernedPersistenceNavigation mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceNavigationEnvelope({
      persistenceTimeline: { status: "ok" },
      clinicalActivationNavigation: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_NAVIGATION_GOVERNANCE },
      reason: "governed_persistence_navigation_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceNavigationEnvelope(null), null);
  });
});

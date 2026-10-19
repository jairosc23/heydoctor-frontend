import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_DASHBOARD_GOVERNANCE } from "./governed-persistence-readiness-dashboard";
import { mapGovernedPersistenceReadinessDashboardEnvelope } from "./governed-persistence-readiness-dashboard-mapper";

describe("Phase 82 GovernedPersistenceReadinessDashboard mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessDashboardEnvelope({
      persistenceReadinessTimeline: { status: "ok" },
      persistenceDashboard: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_DASHBOARD_GOVERNANCE },
      reason: "governed_persistence_readiness_dashboard_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessDashboardEnvelope(null), null);
  });
});

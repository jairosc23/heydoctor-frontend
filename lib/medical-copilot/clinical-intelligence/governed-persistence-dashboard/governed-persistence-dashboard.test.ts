import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_DASHBOARD_GOVERNANCE } from "./governed-persistence-dashboard";
import { mapGovernedPersistenceDashboardEnvelope } from "./governed-persistence-dashboard-mapper";

describe("Phase 73 GovernedPersistenceDashboard mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceDashboardEnvelope({
      persistenceNavigation: { status: "ok" },
      clinicalActivationDashboard: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_DASHBOARD_GOVERNANCE },
      reason: "governed_persistence_dashboard_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceDashboardEnvelope(null), null);
  });
});

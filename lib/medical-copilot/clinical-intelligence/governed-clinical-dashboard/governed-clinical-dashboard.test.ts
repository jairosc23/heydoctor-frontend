import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_DASHBOARD_GOVERNANCE } from "./governed-clinical-dashboard";
import { mapGovernedClinicalDashboardEnvelope } from "./governed-clinical-dashboard-mapper";

describe("Phase 35 GovernedClinicalDashboard mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalDashboardEnvelope({
      physicianDashboard: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_DASHBOARD_GOVERNANCE },
      reason: "governed_clinical_dashboard_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 2);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalDashboardEnvelope(null), null);
  });
});

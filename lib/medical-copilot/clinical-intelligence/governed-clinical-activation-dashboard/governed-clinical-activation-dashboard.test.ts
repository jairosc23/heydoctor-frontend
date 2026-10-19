import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_DASHBOARD_GOVERNANCE } from "./governed-clinical-activation-dashboard";
import { mapGovernedClinicalActivationDashboardEnvelope } from "./governed-clinical-activation-dashboard-mapper";

describe("Phase 65 GovernedClinicalActivationDashboard mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationDashboardEnvelope({
      consultationActivationWorkspace: { status: "ok" },
      clinicalDashboard: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_DASHBOARD_GOVERNANCE },
      reason: "governed_clinical_activation_dashboard_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationDashboardEnvelope(null), null);
  });
});

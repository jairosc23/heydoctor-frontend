import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_SESSION_DASHBOARD_GOVERNANCE } from "./governed-clinical-session-dashboard";
import { mapGovernedClinicalSessionDashboardEnvelope } from "./governed-clinical-session-dashboard-mapper";

describe("Phase 36 GovernedClinicalSessionDashboard mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalSessionDashboardEnvelope({
      clinicalDashboard: { status: "ok" },
      reviewSession: { status: "ok" },
      consultationPackage: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_SESSION_DASHBOARD_GOVERNANCE },
      reason: "governed_clinical_session_dashboard_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 3);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalSessionDashboardEnvelope(null), null);
  });
});

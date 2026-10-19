import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_DASHBOARD_GOVERNANCE } from "./governed-consultation-dashboard";
import { mapGovernedConsultationDashboardEnvelope } from "./governed-consultation-dashboard-mapper";

describe("Phase 33 GovernedConsultationDashboard mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationDashboardEnvelope({
      clinicalWorkspaceConsolidation: { status: "ok" },
      consultationRuntime: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_DASHBOARD_GOVERNANCE },
      reason: "governed_consultation_dashboard_composed_for_physician_review",
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
    assert.equal(mapGovernedConsultationDashboardEnvelope(null), null);
  });
});

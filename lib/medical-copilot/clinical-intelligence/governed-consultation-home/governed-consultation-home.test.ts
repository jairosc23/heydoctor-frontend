import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_HOME_GOVERNANCE } from "./governed-consultation-home";
import { mapGovernedConsultationHomeEnvelope } from "./governed-consultation-home-mapper";

describe("Phase 41 GovernedConsultationHome mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationHomeEnvelope({
      consultationDashboard: { status: "ok" },
      physicianHome: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_HOME_GOVERNANCE },
      reason: "governed_consultation_home_composed_for_physician_review",
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
    assert.equal(mapGovernedConsultationHomeEnvelope(null), null);
  });
});

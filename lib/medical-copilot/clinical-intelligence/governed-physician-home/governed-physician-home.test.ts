import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_HOME_GOVERNANCE } from "./governed-physician-home";
import { mapGovernedPhysicianHomeEnvelope } from "./governed-physician-home-mapper";

describe("Phase 40 GovernedPhysicianHome mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianHomeEnvelope({
      physicianDashboard: { status: "ok" },
      clinicalHome: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_HOME_GOVERNANCE },
      reason: "governed_physician_home_composed_for_physician_review",
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
    assert.equal(mapGovernedPhysicianHomeEnvelope(null), null);
  });
});

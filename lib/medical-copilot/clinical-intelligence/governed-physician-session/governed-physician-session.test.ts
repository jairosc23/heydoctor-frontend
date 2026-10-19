import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_SESSION_GOVERNANCE } from "./governed-physician-session";
import { mapGovernedPhysicianSessionEnvelope } from "./governed-physician-session-mapper";

describe("Phase 57 GovernedPhysicianSession mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianSessionEnvelope({
      clinicalReviewPackage: { status: "ok" },
      physicianDashboard: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_SESSION_GOVERNANCE },
      reason: "governed_physician_session_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPhysicianSessionEnvelope(null), null);
  });
});

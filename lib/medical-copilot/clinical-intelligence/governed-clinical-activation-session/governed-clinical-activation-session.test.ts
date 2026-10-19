import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_SESSION_GOVERNANCE } from "./governed-clinical-activation-session";
import { mapGovernedClinicalActivationSessionEnvelope } from "./governed-clinical-activation-session-mapper";

describe("Phase 66 GovernedClinicalActivationSession mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationSessionEnvelope({
      activationDashboard: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_SESSION_GOVERNANCE },
      reason: "governed_clinical_activation_session_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationSessionEnvelope(null), null);
  });
});

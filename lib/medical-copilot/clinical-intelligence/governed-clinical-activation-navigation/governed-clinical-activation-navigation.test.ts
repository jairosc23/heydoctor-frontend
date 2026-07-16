import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_NAVIGATION_GOVERNANCE } from "./governed-clinical-activation-navigation";
import { mapGovernedClinicalActivationNavigationEnvelope } from "./governed-clinical-activation-navigation-mapper";

describe("Phase 62 GovernedClinicalActivationNavigation mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationNavigationEnvelope({
      activationTimeline: { status: "ok" },
      clinicalNavigation: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_NAVIGATION_GOVERNANCE },
      reason: "governed_clinical_activation_navigation_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationNavigationEnvelope(null), null);
  });
});

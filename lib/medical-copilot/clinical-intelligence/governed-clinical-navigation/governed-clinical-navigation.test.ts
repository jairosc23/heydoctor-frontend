import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_NAVIGATION_GOVERNANCE } from "./governed-clinical-navigation";
import { mapGovernedClinicalNavigationEnvelope } from "./governed-clinical-navigation-mapper";

describe("Phase 44 GovernedClinicalNavigation mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalNavigationEnvelope({
      encounterTimeline: { status: "ok" },
      clinicalWorkspace: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_NAVIGATION_GOVERNANCE },
      reason: "governed_clinical_navigation_composed_for_physician_review",
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
    assert.equal(mapGovernedClinicalNavigationEnvelope(null), null);
  });
});

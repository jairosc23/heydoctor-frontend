import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_HOME_GOVERNANCE } from "./governed-clinical-home";
import { mapGovernedClinicalHomeEnvelope } from "./governed-clinical-home-mapper";

describe("Phase 39 GovernedClinicalHome mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalHomeEnvelope({
      clinicalWorkspacePackage: { status: "ok" },
      clinicalDashboard: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_HOME_GOVERNANCE },
      reason: "governed_clinical_home_composed_for_physician_review",
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
    assert.equal(mapGovernedClinicalHomeEnvelope(null), null);
  });
});

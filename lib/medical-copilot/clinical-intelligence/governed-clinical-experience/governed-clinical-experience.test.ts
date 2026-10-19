import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_EXPERIENCE_GOVERNANCE } from "./governed-clinical-experience";
import { mapGovernedClinicalExperienceEnvelope } from "./governed-clinical-experience-mapper";

describe("Phase 45 GovernedClinicalExperience mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalExperienceEnvelope({
      clinicalNavigation: { status: "ok" },
      clinicalSessionDashboard: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_EXPERIENCE_GOVERNANCE },
      reason: "governed_clinical_experience_composed_for_physician_review",
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
    assert.equal(mapGovernedClinicalExperienceEnvelope(null), null);
  });
});

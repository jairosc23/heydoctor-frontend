import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_EXPERIENCE_PACKAGE_GOVERNANCE } from "./governed-clinical-experience-package";
import { mapGovernedClinicalExperiencePackageEnvelope } from "./governed-clinical-experience-package-mapper";

describe("Phase 48 GovernedClinicalExperiencePackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalExperiencePackageEnvelope({
      consultationExperience: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      consultationPackage: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      clinicalDashboard: { status: "ok" },
      physicianDashboard: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_EXPERIENCE_PACKAGE_GOVERNANCE },
      reason: "governed_clinical_experience_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 7);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalExperiencePackageEnvelope(null), null);
  });
});

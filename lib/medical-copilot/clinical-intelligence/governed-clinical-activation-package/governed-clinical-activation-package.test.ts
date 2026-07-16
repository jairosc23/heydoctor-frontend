import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_PACKAGE_GOVERNANCE } from "./governed-clinical-activation-package";
import { mapGovernedClinicalActivationPackageEnvelope } from "./governed-clinical-activation-package-mapper";

describe("Phase 68 GovernedClinicalActivationPackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationPackageEnvelope({
      clinicalActivationRuntime: { status: "ok" },
      physicianRuntimePackage: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      consultationPackage: { status: "ok" },
      documentationPackage: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_PACKAGE_GOVERNANCE },
      reason: "governed_clinical_activation_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationPackageEnvelope(null), null);
  });
});

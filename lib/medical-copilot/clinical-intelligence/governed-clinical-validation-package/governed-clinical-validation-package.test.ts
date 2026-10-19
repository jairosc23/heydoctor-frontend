import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_VALIDATION_PACKAGE_GOVERNANCE } from "./governed-clinical-validation-package";
import { mapGovernedClinicalValidationPackageEnvelope } from "./governed-clinical-validation-package-mapper";

describe("Governed Clinical Validation Package mapper", () => {
  it("maps Block surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalValidationPackageEnvelope({
      ownershipValidator: { status: "ok" },
      tenantValidator: { status: "ok" },
      clinicValidator: { status: "ok" },
      sessionValidator: { status: "ok" },
      versionValidator: { status: "ok" },
      entityValidator: { status: "ok" },
      draftValidator: { status: "ok" },
      approvalValidator: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_VALIDATION_PACKAGE_GOVERNANCE },
      reason: "governed_clinical_validation_package_prepared_not_executed",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalValidationPackageEnvelope(null), null);
  });
});

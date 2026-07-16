import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_WORKSPACE_PACKAGE_GOVERNANCE } from "./governed-clinical-workspace-package";
import { mapGovernedClinicalWorkspacePackageEnvelope } from "./governed-clinical-workspace-package-mapper";

describe("Phase 38 GovernedClinicalWorkspacePackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalWorkspacePackageEnvelope({
      clinicalOverview: { status: "ok" },
      clinicalWorkspace: { status: "ok" },
      consultationPackage: { status: "ok" },
      documentationPackage: { status: "ok" },
      clinicalEncounter: { status: "ok" },
      reviewSession: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_WORKSPACE_PACKAGE_GOVERNANCE },
      reason: "governed_clinical_workspace_package_composed_for_physician_review",
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
    assert.equal(mapGovernedClinicalWorkspacePackageEnvelope(null), null);
  });
});

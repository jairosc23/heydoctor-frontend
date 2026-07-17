import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PHYSICIAN_RUNTIME_PACKAGE_GOVERNANCE } from "./governed-physician-runtime-package";
import { mapGovernedPhysicianRuntimePackageEnvelope } from "./governed-physician-runtime-package-mapper";

describe("Phase 58 GovernedPhysicianRuntimePackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPhysicianRuntimePackageEnvelope({
      physicianSession: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      documentationPackage: { status: "ok" },
      consultationPackage: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_PHYSICIAN_RUNTIME_PACKAGE_GOVERNANCE },
      reason: "governed_physician_runtime_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPhysicianRuntimePackageEnvelope(null), null);
  });
});

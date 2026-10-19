import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_PACKAGE_GOVERNANCE } from "./governed-persistence-package";
import { mapGovernedPersistencePackageEnvelope } from "./governed-persistence-package-mapper";

describe("Phase 78 GovernedPersistencePackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistencePackageEnvelope({
      persistenceValidation: { status: "ok" },
      clinicalActivationPackage: { status: "ok" },
      physicianRuntimePackage: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      documentationPackage: { status: "ok" },
      consultationPackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_PACKAGE_GOVERNANCE },
      reason: "governed_persistence_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistencePackageEnvelope(null), null);
  });
});

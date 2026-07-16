import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_PACKAGE_GOVERNANCE } from "./governed-persistence-readiness-package";
import { mapGovernedPersistenceReadinessPackageEnvelope } from "./governed-persistence-readiness-package-mapper";

describe("Phase 88 GovernedPersistenceReadinessPackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessPackageEnvelope({
      persistenceReadinessConsolidation: { status: "ok" },
      persistencePackage: { status: "ok" },
      clinicalActivationPackage: { status: "ok" },
      physicianRuntimePackage: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      documentationPackage: { status: "ok" },
      consultationPackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_PACKAGE_GOVERNANCE },
      reason: "governed_persistence_readiness_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessPackageEnvelope(null), null);
  });
});

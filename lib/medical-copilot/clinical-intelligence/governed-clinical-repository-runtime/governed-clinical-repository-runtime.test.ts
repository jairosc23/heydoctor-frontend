import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REPOSITORY_RUNTIME_GOVERNANCE } from "./governed-clinical-repository-runtime";
import { mapGovernedClinicalRepositoryRuntimeEnvelope } from "./governed-clinical-repository-runtime-mapper";

describe("Governed Clinical Repository Runtime mapper", () => {
  it("maps Block 3 surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalRepositoryRuntimeEnvelope({
      resolver: { invokesRepository: false, usesReflection: false },
      capabilities: { anyWriteEnabled: false },
      readiness: { anyReady: false, anyConnected: false },
      registry: { anyConnected: false },
      adapters: [{ adapterId: "consultations", implementationClass: null }],
      authorization: { authorizedToPersist: false },
      validation: { allowsWrite: false },
      health: { ready: true, blocked: true, writesEmr: false },
      governance: { ...GOVERNED_CLINICAL_REPOSITORY_RUNTIME_GOVERNANCE },
      reason: "governed_clinical_repository_runtime_prepared_no_write",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalRepositoryRuntimeEnvelope(null), null);
  });
});

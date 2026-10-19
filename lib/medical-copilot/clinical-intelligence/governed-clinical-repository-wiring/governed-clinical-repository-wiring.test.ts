import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REPOSITORY_WIRING_GOVERNANCE } from "./governed-clinical-repository-wiring";
import { mapGovernedClinicalRepositoryWiringEnvelope } from "./governed-clinical-repository-wiring-mapper";

describe("Governed Clinical Repository Wiring mapper", () => {
  it("maps Block surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalRepositoryWiringEnvelope({
      wiring: { status: "ok" },
      descriptorRegistry: { status: "ok" },
      dependencyGraph: { status: "ok" },
      resolutionContext: { status: "ok" },
      bindingContracts: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_REPOSITORY_WIRING_GOVERNANCE },
      reason: "governed_clinical_repository_wiring_prepared_no_connection",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalRepositoryWiringEnvelope(null), null);
  });
});

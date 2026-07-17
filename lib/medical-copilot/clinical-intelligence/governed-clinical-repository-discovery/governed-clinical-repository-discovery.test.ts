import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REPOSITORY_DISCOVERY_GOVERNANCE } from "./governed-clinical-repository-discovery";
import { mapGovernedClinicalRepositoryDiscoveryEnvelope } from "./governed-clinical-repository-discovery-mapper";

describe("Governed Clinical Repository Discovery mapper", () => {
  it("maps surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalRepositoryDiscoveryEnvelope({
      discovery: { status: "ok" },
      metadataRegistry: { status: "ok" },
      endpointCatalog: { status: "ok" },
      featureRegistry: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_REPOSITORY_DISCOVERY_GOVERNANCE },
      reason: "governed_clinical_repository_discovery_prepared_not_invoked",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalRepositoryDiscoveryEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ENTITY_MAPPING_GOVERNANCE } from "./governed-clinical-entity-mapping";
import { mapGovernedClinicalEntityMappingEnvelope } from "./governed-clinical-entity-mapping-mapper";

describe("Governed Clinical Entity Mapping mapper", () => {
  it("maps surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalEntityMappingEnvelope({
  mappingRuntime: {
  consultationMapping: { mapped: false, resolved: false },
  soapMapping: { mapped: false, resolved: false },
  prescriptionMapping: { mapped: false, resolved: false },
  ordersMapping: { mapped: false, resolved: false },
  referralMapping: { mapped: false, resolved: false },
  clinicalDocumentsMapping: { mapped: false, resolved: false },
  },
      governance: { ...GOVERNED_CLINICAL_ENTITY_MAPPING_GOVERNANCE },
      reason: "governed_clinical_mapping_package_prepared_unresolved",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalEntityMappingEnvelope(null), null);
  });
});

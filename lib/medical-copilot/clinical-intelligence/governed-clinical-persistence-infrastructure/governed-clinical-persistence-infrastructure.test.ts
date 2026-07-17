import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_PERSISTENCE_INFRASTRUCTURE_GOVERNANCE } from "./governed-clinical-persistence-infrastructure";
import { mapGovernedClinicalPersistenceInfrastructureEnvelope } from "./governed-clinical-persistence-infrastructure-mapper";

describe("Governed Clinical Persistence infrastructure mapper", () => {
  it("maps contracts and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalPersistenceInfrastructureEnvelope({
      intent: { intentId: "gpi_1" },
      approvalGate: { eligible: false },
      policy: { allowsPersistence: false },
      auditContract: { written: false },
      correlation: { futureEntityId: null },
      idempotency: { storage: "none" },
      domainAdapters: [{ name: "prescriptions", implemented: false }],
      outcome: { status: "READY", persisted: false },
      governance: { ...GOVERNED_CLINICAL_PERSISTENCE_INFRASTRUCTURE_GOVERNANCE },
      reason: "governed_clinical_persistence_infrastructure_prepared_no_write",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalPersistenceInfrastructureEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_PERSISTENCE_RUNTIME_STATE_GOVERNANCE } from "./governed-clinical-persistence-runtime-state";
import { mapGovernedClinicalPersistenceRuntimeStateEnvelope } from "./governed-clinical-persistence-runtime-state-mapper";

describe("Governed Clinical Persistence Runtime State mapper", () => {
  it("maps Block 2 surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalPersistenceRuntimeStateEnvelope({
      intent: { intentId: "gpi_1" },
      transaction: { transactionId: "gptx_1", committed: false },
      authorization: { authorizedToPersist: false },
      validation: { allowsWrite: false, valid: true },
      lifecycle: { status: "READY", writeEnabled: false },
      audit: { written: false },
      rollback: { executed: false },
      outcome: { status: "READY", persisted: false },
      health: { ready: true, blocked: true },
      repositoryRegistry: { anyConnected: false },
      governance: { ...GOVERNED_CLINICAL_PERSISTENCE_RUNTIME_STATE_GOVERNANCE },
      reason: "governed_clinical_persistence_runtime_state_prepared_no_write",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalPersistenceRuntimeStateEnvelope(null), null);
  });
});

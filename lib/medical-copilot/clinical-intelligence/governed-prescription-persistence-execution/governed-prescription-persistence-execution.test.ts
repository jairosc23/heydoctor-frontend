import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PRESCRIPTION_PERSISTENCE_EXECUTION_GOVERNANCE } from "./governed-prescription-persistence-execution";
import { mapGovernedPrescriptionPersistenceExecutionEnvelope } from "./governed-prescription-persistence-execution-mapper";
describe("GovernedPrescriptionPersistenceExecution mapper", () => {
  it("maps BLOCKED evaluate without write", () => {
    const mapped = mapGovernedPrescriptionPersistenceExecutionEnvelope({
      status: "BLOCKED", writeAttempted: false, writeExecuted: false, entityPersisted: false,
      repositoryInvoked: false, rollbackExecuted: false, writesEmr: false,
      runtime: {
        validation: { draftApproved: false }, writeCoordinator: { domain: "prescriptions" },
        transactionCoordinator: { opened: false }, repositoryConnector: { connected: true },
        executor: { executed: false }, auditWriter: { written: false }, rollbackHandler: { executed: false },
      },
      governance: { ...GOVERNED_PRESCRIPTION_PERSISTENCE_EXECUTION_GOVERNANCE },
    });
    assert.ok(mapped);
    assert.equal(mapped.status, "BLOCKED");
    assert.equal(mapped.writeExecuted, false);
    assert.ok(mapped.components.every((c) => c.present));
    assert.equal(mapGovernedPrescriptionPersistenceExecutionEnvelope(null), null);
  });
});

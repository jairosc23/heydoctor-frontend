import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_SOAP_PERSISTENCE_EXECUTION_GOVERNANCE } from "./governed-soap-persistence-execution";
import { mapGovernedSoapPersistenceExecutionEnvelope } from "./governed-soap-persistence-execution-mapper";
describe("GovernedSoapPersistenceExecution mapper", () => {
  it("maps BLOCKED evaluate without write", () => {
    const mapped = mapGovernedSoapPersistenceExecutionEnvelope({
      status: "BLOCKED", writeAttempted: false, writeExecuted: false, entityPersisted: false,
      repositoryInvoked: false, rollbackExecuted: false, writesEmr: false,
      runtime: {
        validation: { draftApproved: false }, writeCoordinator: { domain: "soap" },
        transactionCoordinator: { opened: false }, repositoryConnector: { connected: true },
        executor: { executed: false }, auditWriter: { written: false }, rollbackHandler: { executed: false },
      },
      governance: { ...GOVERNED_SOAP_PERSISTENCE_EXECUTION_GOVERNANCE },
    });
    assert.ok(mapped);
    assert.equal(mapped.status, "BLOCKED");
    assert.equal(mapped.writeExecuted, false);
    assert.ok(mapped.components.every((c) => c.present));
    assert.equal(mapGovernedSoapPersistenceExecutionEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_DOCUMENTS_PERSISTENCE_EXECUTION_GOVERNANCE } from "./governed-clinical-documents-persistence-execution";
import { mapGovernedClinicalDocumentsPersistenceExecutionEnvelope } from "./governed-clinical-documents-persistence-execution-mapper";
describe("GovernedClinicalDocumentsPersistenceExecution mapper", () => {
  it("maps BLOCKED evaluate without write", () => {
    const mapped = mapGovernedClinicalDocumentsPersistenceExecutionEnvelope({
      status: "BLOCKED", writeAttempted: false, writeExecuted: false, entityPersisted: false,
      repositoryInvoked: false, rollbackExecuted: false, writesEmr: false,
      runtime: {
        validation: { draftApproved: false }, writeCoordinator: { domain: "clinical_documents" },
        transactionCoordinator: { opened: false }, repositoryConnector: { connected: true },
        executor: { executed: false }, auditWriter: { written: false }, rollbackHandler: { executed: false },
      },
      governance: { ...GOVERNED_CLINICAL_DOCUMENTS_PERSISTENCE_EXECUTION_GOVERNANCE },
    });
    assert.ok(mapped);
    assert.equal(mapped.status, "BLOCKED");
    assert.equal(mapped.writeExecuted, false);
    assert.ok(mapped.components.every((c) => c.present));
    assert.equal(mapGovernedClinicalDocumentsPersistenceExecutionEnvelope(null), null);
  });
});

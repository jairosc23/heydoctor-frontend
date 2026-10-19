import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_PERSISTENCE_EXECUTION_GOVERNANCE } from "./governed-consultation-persistence-execution";
import { mapGovernedConsultationPersistenceExecutionEnvelope } from "./governed-consultation-persistence-execution-mapper";

describe("GovernedConsultationPersistenceExecution mapper", () => {
  it("maps BLOCKED evaluate surface without write", () => {
    const mapped = mapGovernedConsultationPersistenceExecutionEnvelope({
      status: "BLOCKED",
      writeAttempted: false,
      writeExecuted: false,
      entityPersisted: false,
      repositoryInvoked: false,
      rollbackExecuted: false,
      writesEmr: false,
      runtime: {
        validation: { draftApproved: false, allGatesPassed: false },
        writeCoordinator: { domain: "consultations" },
        transactionCoordinator: { opened: false },
        repositoryConnector: { connected: true },
        executor: { executed: false },
        auditWriter: { written: false },
        rollbackHandler: { executed: false },
      },
      governance: { ...GOVERNED_CONSULTATION_PERSISTENCE_EXECUTION_GOVERNANCE },
      reason: "governed_consultation_persistence_execution_blocked_gates_incomplete",
    });
    assert.ok(mapped);
    assert.equal(mapped.status, "BLOCKED");
    assert.equal(mapped.writeExecuted, false);
    assert.equal(mapped.entityPersisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly));
    assert.equal(mapGovernedConsultationPersistenceExecutionEnvelope(null), null);
  });
});

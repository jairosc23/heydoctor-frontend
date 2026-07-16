import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ORDERS_PERSISTENCE_EXECUTION_GOVERNANCE } from "./governed-orders-persistence-execution";
import { mapGovernedOrdersPersistenceExecutionEnvelope } from "./governed-orders-persistence-execution-mapper";
describe("GovernedOrdersPersistenceExecution mapper", () => {
  it("maps BLOCKED evaluate without write", () => {
    const mapped = mapGovernedOrdersPersistenceExecutionEnvelope({
      status: "BLOCKED", writeAttempted: false, writeExecuted: false, entityPersisted: false,
      repositoryInvoked: false, rollbackExecuted: false, writesEmr: false,
      runtime: {
        validation: { draftApproved: false }, writeCoordinator: { domain: "orders" },
        transactionCoordinator: { opened: false }, repositoryConnector: { connected: true },
        executor: { executed: false }, auditWriter: { written: false }, rollbackHandler: { executed: false },
      },
      governance: { ...GOVERNED_ORDERS_PERSISTENCE_EXECUTION_GOVERNANCE },
    });
    assert.ok(mapped);
    assert.equal(mapped.status, "BLOCKED");
    assert.equal(mapped.writeExecuted, false);
    assert.ok(mapped.components.every((c) => c.present));
    assert.equal(mapGovernedOrdersPersistenceExecutionEnvelope(null), null);
  });
});

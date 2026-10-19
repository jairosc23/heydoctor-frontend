import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_EXECUTION_PACKAGE_GOVERNANCE } from "./governed-clinical-execution-package";
import { mapGovernedClinicalExecutionPackageEnvelope } from "./governed-clinical-execution-package-mapper";

describe("Governed Clinical Execution Preparation mapper", () => {
  it("maps Block surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalExecutionPackageEnvelope({
      executionRuntime: {
        executionPlanner: { planned: true, executed: false },
        writePlanner: { planned: true, executed: false, writesEmr: false },
        rollbackPlanner: { planned: true, executed: false },
        transactionPlanner: { planned: true, executed: false },
        strategy: { planned: true, executed: false, autoPersist: false },
        context: { planned: true, executed: false },
        readiness: { readyToExecute: false, planned: true },
        preview: { planned: true, executed: false, persisted: false },
      },
      governance: { ...GOVERNED_CLINICAL_EXECUTION_PACKAGE_GOVERNANCE },
      reason: "governed_clinical_execution_package_prepared_not_executed",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalExecutionPackageEnvelope(null), null);
  });
});

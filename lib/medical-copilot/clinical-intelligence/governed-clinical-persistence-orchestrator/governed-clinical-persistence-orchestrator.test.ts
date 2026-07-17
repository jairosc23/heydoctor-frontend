import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_PERSISTENCE_ORCHESTRATOR_GOVERNANCE } from "./governed-clinical-persistence-orchestrator";
import { mapGovernedClinicalPersistenceOrchestratorEnvelope } from "./governed-clinical-persistence-orchestrator-mapper";

describe("Governed Clinical Persistence Orchestrator mapper", () => {
  it("maps surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalPersistenceOrchestratorEnvelope({
  orchestrationRuntime: {
  orchestrator: { executes: false, callsRepositories: false },
  context: { executing: false },
  state: { phase: "prepared", executing: false },
  referencedSurfaces: { infrastructurePresent: true },
  },
      governance: { ...GOVERNED_CLINICAL_PERSISTENCE_ORCHESTRATOR_GOVERNANCE },
      reason: "governed_clinical_orchestration_package_prepared_not_executed",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalPersistenceOrchestratorEnvelope(null), null);
  });
});

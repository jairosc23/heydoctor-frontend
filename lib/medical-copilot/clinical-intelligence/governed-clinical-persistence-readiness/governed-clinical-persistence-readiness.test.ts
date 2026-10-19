import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_PERSISTENCE_READINESS_GOVERNANCE } from "./governed-clinical-persistence-readiness";
import { mapGovernedClinicalPersistenceReadinessEnvelope } from "./governed-clinical-persistence-readiness-mapper";

describe("Governed Clinical Persistence Final Readiness mapper", () => {
  it("maps surface and preserves no-write governance", () => {
    const mapped = mapGovernedClinicalPersistenceReadinessEnvelope({
  readinessRuntime: {
  evaluation: { readyForPersistence: false, writesAllowed: false, approvalGranted: false },
  capabilitySummary: { wiringConnected: false, executionEnabled: false },
  blockingConditions: [{ code: "wiring_not_connected", blocksWrite: true }],
  governanceCheck: { passed: true, draftApproved: false },
  },
      governance: { ...GOVERNED_CLINICAL_PERSISTENCE_READINESS_GOVERNANCE },
      reason: "governed_clinical_final_readiness_not_ready_for_persistence",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.persisted, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalPersistenceReadinessEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_VALIDATION_GOVERNANCE } from "./governed-persistence-readiness-validation";
import { mapGovernedPersistenceReadinessValidationEnvelope } from "./governed-persistence-readiness-validation-mapper";

describe("Phase 86 GovernedPersistenceReadinessValidation mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessValidationEnvelope({
      persistenceReadinessPreview: { status: "ok" },
      persistenceValidation: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_VALIDATION_GOVERNANCE },
      reason: "governed_persistence_readiness_validation_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessValidationEnvelope(null), null);
  });
});

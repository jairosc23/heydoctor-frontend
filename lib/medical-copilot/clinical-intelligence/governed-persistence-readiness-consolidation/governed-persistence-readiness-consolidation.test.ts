import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_CONSOLIDATION_GOVERNANCE } from "./governed-persistence-readiness-consolidation";
import { mapGovernedPersistenceReadinessConsolidationEnvelope } from "./governed-persistence-readiness-consolidation-mapper";

describe("Phase 87 GovernedPersistenceReadinessConsolidation mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessConsolidationEnvelope({
      persistenceReadinessValidation: { status: "ok" },
      clinicalExperiencePackage: { status: "ok" },
      clinicalWorkspacePackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_CONSOLIDATION_GOVERNANCE },
      reason: "governed_persistence_readiness_consolidation_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessConsolidationEnvelope(null), null);
  });
});

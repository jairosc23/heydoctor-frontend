import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_READINESS_REVIEW_GOVERNANCE } from "./governed-persistence-readiness-review";
import { mapGovernedPersistenceReadinessReviewEnvelope } from "./governed-persistence-readiness-review-mapper";

describe("Phase 80 GovernedPersistenceReadinessReview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReadinessReviewEnvelope({
      persistenceReadinessWorkspace: { status: "ok" },
      clinicalReviewPackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_READINESS_REVIEW_GOVERNANCE },
      reason: "governed_persistence_readiness_review_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReadinessReviewEnvelope(null), null);
  });
});

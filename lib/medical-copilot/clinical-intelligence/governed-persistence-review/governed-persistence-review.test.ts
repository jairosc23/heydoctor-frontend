import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PERSISTENCE_REVIEW_GOVERNANCE } from "./governed-persistence-review";
import { mapGovernedPersistenceReviewEnvelope } from "./governed-persistence-review-mapper";

describe("Phase 70 GovernedPersistenceReview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedPersistenceReviewEnvelope({
      persistencePreparationWorkspace: { status: "ok" },
      clinicalReviewPackage: { status: "ok" },
      governance: { ...GOVERNED_PERSISTENCE_REVIEW_GOVERNANCE },
      reason: "governed_persistence_review_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedPersistenceReviewEnvelope(null), null);
  });
});

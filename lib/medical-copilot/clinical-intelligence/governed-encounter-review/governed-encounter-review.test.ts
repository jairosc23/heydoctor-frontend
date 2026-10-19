import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ENCOUNTER_REVIEW_GOVERNANCE } from "./governed-encounter-review";
import { mapGovernedEncounterReviewEnvelope } from "./governed-encounter-review-mapper";

describe("Phase 25 GovernedEncounterReview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedEncounterReviewEnvelope({
      encounterWorkspace: { status: "ok" },
      reviewSession: { status: "ok" },
      governance: { ...GOVERNED_ENCOUNTER_REVIEW_GOVERNANCE },
      reason: "governed_encounter_review_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 2);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedEncounterReviewEnvelope(null), null);
  });
});

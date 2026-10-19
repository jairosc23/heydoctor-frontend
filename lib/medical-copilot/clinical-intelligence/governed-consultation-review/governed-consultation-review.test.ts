import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CONSULTATION_REVIEW_GOVERNANCE } from "./governed-consultation-review";
import { mapGovernedConsultationReviewEnvelope } from "./governed-consultation-review-mapper";

describe("Phase 22 GovernedConsultationReview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedConsultationReviewEnvelope({
      consultationSnapshot: { status: "ok" },
      physicianWorkspace: { status: "ok" },
      documentationPackage: { status: "ok" },
      governance: { ...GOVERNED_CONSULTATION_REVIEW_GOVERNANCE },
      reason: "governed_consultation_review_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 3);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedConsultationReviewEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ACTIVATION_REVIEW_GOVERNANCE } from "./governed-clinical-activation-review";
import { mapGovernedClinicalActivationReviewEnvelope } from "./governed-clinical-activation-review-mapper";

describe("Phase 60 GovernedClinicalActivationReview mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalActivationReviewEnvelope({
      activationWorkspace: { status: "ok" },
      clinicalReviewPackage: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ACTIVATION_REVIEW_GOVERNANCE },
      reason: "governed_clinical_activation_review_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalActivationReviewEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REVIEW_PACKAGE_GOVERNANCE } from "./governed-clinical-review-package";
import { mapGovernedClinicalReviewPackageEnvelope } from "./governed-clinical-review-package-mapper";

describe("Phase 56 GovernedClinicalReviewPackage mapper", () => {
  it("maps composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalReviewPackageEnvelope({
      pendingActions: { status: "ok" },
      reviewSession: { status: "ok" },
      consultationExperience: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_REVIEW_PACKAGE_GOVERNANCE },
      reason: "governed_clinical_review_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.ok(mapped.components.every((c) => c.present && c.readOnly && !c.persisted));
    assert.equal(mapGovernedClinicalReviewPackageEnvelope(null), null);
  });
});

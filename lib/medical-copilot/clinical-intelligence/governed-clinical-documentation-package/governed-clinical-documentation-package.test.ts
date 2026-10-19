import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_DOCUMENTATION_PACKAGE_GOVERNANCE } from "./governed-clinical-documentation-package";
import { mapGovernedClinicalDocumentationPackageEnvelope } from "./governed-clinical-documentation-package-mapper";

describe("Phase 17 GovernedClinicalDocumentationPackage mapper", () => {
  it("maps package composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalDocumentationPackageEnvelope({
      clinicalDraft: { status: "pending_physician_review" },
      soapDraft: { subjective: { status: "empty_structural_slot" } },
      prescriptionDraft: { status: "pending_physician_review" },
      ordersDraft: { status: "pending_physician_review" },
      referralDraft: { status: "pending_physician_review" },
      medicalCertificateDraft: { status: "pending_physician_review" },
      medicalLeaveDraft: { status: "pending_physician_review" },
      patientInstructionsDraft: { status: "pending_physician_review" },
      followUpDraft: { status: "pending_physician_review" },
      clinicalVisitSummaryDraft: { status: "pending_physician_review" },
      carePlanDraft: { status: "pending_physician_review" },
      patientEducationDraft: { status: "pending_physician_review" },
      dischargeDraft: { status: "pending_physician_review" },
      governance: { ...GOVERNED_CLINICAL_DOCUMENTATION_PACKAGE_GOVERNANCE },
      reason:
        "governed_clinical_documentation_package_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.documents.length, 13);
    assert.ok(mapped.documents.every((doc) => doc.present));
    assert.ok(mapped.documents.every((doc) => doc.readOnly));
    assert.ok(mapped.documents.every((doc) => !doc.persisted));
    assert.equal(mapGovernedClinicalDocumentationPackageEnvelope(null), null);
  });
});

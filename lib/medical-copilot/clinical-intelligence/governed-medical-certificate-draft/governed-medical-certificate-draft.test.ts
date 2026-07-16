import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_MEDICAL_CERTIFICATE_DRAFT_GOVERNANCE } from "./governed-medical-certificate-draft";
import { mapGovernedMedicalCertificateDraftEnvelope } from "./governed-medical-certificate-draft-mapper";

describe("Phase 9 GovernedMedicalCertificateDraft mapper", () => {
  it("maps empty structural certificate slots and preserves HITL", () => {
    const mapped = mapGovernedMedicalCertificateDraftEnvelope({
      referralDraft: { status: "pending_physician_review" },
      medicalCertificateDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        certificateItems: [
          { slotKey: "certificate_type_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "diagnosis_reference_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "justification_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "restriction_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "validity_period_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "observations_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_MEDICAL_CERTIFICATE_DRAFT_GOVERNANCE },
      reason:
        "governed_medical_certificate_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.medicalCertificateDraft.persisted, false);
    assert.equal(mapped.medicalCertificateDraft.certificateItems.length, 6);
    assert.equal(mapped.medicalCertificateDraft.certificateItems[0].value, null);
    assert.equal(mapGovernedMedicalCertificateDraftEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_MEDICAL_LEAVE_DRAFT_GOVERNANCE } from "./governed-medical-leave-draft";
import { mapGovernedMedicalLeaveDraftEnvelope } from "./governed-medical-leave-draft-mapper";

describe("Phase 10 GovernedMedicalLeaveDraft mapper", () => {
  it("maps empty structural leave slots and preserves HITL", () => {
    const mapped = mapGovernedMedicalLeaveDraftEnvelope({
      medicalCertificateDraft: { status: "pending_physician_review" },
      medicalLeaveDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        medicalLeaveItems: [
          {
            slotKey: "leave_type_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "diagnosis_reference_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "start_date_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "end_date_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "duration_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "work_restrictions_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_MEDICAL_LEAVE_DRAFT_GOVERNANCE },
      reason:
        "governed_medical_leave_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.medicalLeaveDraft.persisted, false);
    assert.equal(mapped.medicalLeaveDraft.medicalLeaveItems.length, 6);
    assert.equal(mapped.medicalLeaveDraft.medicalLeaveItems[0].value, null);
    assert.equal(mapGovernedMedicalLeaveDraftEnvelope(null), null);
  });
});

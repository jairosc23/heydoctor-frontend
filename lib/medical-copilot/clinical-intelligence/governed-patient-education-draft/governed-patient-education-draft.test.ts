import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PATIENT_EDUCATION_DRAFT_GOVERNANCE } from "./governed-patient-education-draft";
import { mapGovernedPatientEducationDraftEnvelope } from "./governed-patient-education-draft-mapper";

describe("Phase 15 GovernedPatientEducationDraft mapper", () => {
  it("maps empty structural education slots and preserves HITL", () => {
    const mapped = mapGovernedPatientEducationDraftEnvelope({
      carePlanDraft: { status: "pending_physician_review" },
      patientEducationDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        patientEducationItems: [
          {
            slotKey: "diagnosis_education_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "medication_education_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "lifestyle_education_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "warning_signs_education_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "prevention_education_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "educational_notes_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-14T00:00:00.000Z",
      },
      governance: { ...GOVERNED_PATIENT_EDUCATION_DRAFT_GOVERNANCE },
      reason:
        "governed_patient_education_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.patientEducationDraft.persisted, false);
    assert.equal(mapped.patientEducationDraft.patientEducationItems.length, 6);
    assert.equal(
      mapped.patientEducationDraft.patientEducationItems[0].value,
      null,
    );
    assert.equal(mapGovernedPatientEducationDraftEnvelope(null), null);
  });
});

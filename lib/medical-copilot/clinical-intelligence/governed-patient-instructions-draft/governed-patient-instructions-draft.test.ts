import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PATIENT_INSTRUCTIONS_DRAFT_GOVERNANCE } from "./governed-patient-instructions-draft";
import { mapGovernedPatientInstructionsDraftEnvelope } from "./governed-patient-instructions-draft-mapper";

describe("Phase 11 GovernedPatientInstructionsDraft mapper", () => {
  it("maps empty structural instruction slots and preserves HITL", () => {
    const mapped = mapGovernedPatientInstructionsDraftEnvelope({
      medicalLeaveDraft: { status: "pending_physician_review" },
      patientInstructionsDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        patientInstructionItems: [
          {
            slotKey: "medication_instructions_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "activity_recommendations_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "diet_recommendations_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "warning_signs_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "home_care_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "followup_instructions_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_PATIENT_INSTRUCTIONS_DRAFT_GOVERNANCE },
      reason:
        "governed_patient_instructions_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.patientInstructionsDraft.persisted, false);
    assert.equal(
      mapped.patientInstructionsDraft.patientInstructionItems.length,
      6,
    );
    assert.equal(
      mapped.patientInstructionsDraft.patientInstructionItems[0].value,
      null,
    );
    assert.equal(mapGovernedPatientInstructionsDraftEnvelope(null), null);
  });
});

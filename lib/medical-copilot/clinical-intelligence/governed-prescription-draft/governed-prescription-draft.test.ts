import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_PRESCRIPTION_DRAFT_GOVERNANCE } from "./governed-prescription-draft";
import { mapGovernedPrescriptionDraftEnvelope } from "./governed-prescription-draft-mapper";

describe("Phase 6 GovernedPrescriptionDraft mapper", () => {
  it("maps empty structural slots and preserves HITL", () => {
    const mapped = mapGovernedPrescriptionDraftEnvelope({
      soapDraft: { subjective: { section: "subjective" } },
      prescriptionDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        prescriptionItems: [
          { slotKey: "medication_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "dosage_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "frequency_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "duration_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "route_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "indication_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_PRESCRIPTION_DRAFT_GOVERNANCE },
      reason: "governed_prescription_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.prescriptionDraft.persisted, false);
    assert.equal(mapped.prescriptionDraft.prescriptionItems.length, 6);
    assert.equal(mapped.prescriptionDraft.prescriptionItems[0].value, null);
    assert.equal(mapGovernedPrescriptionDraftEnvelope(null), null);
  });
});

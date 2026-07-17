import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_DISCHARGE_DRAFT_GOVERNANCE } from "./governed-discharge-draft";
import { mapGovernedDischargeDraftEnvelope } from "./governed-discharge-draft-mapper";

describe("Phase 16 GovernedDischargeDraft mapper", () => {
  it("maps empty structural discharge slots and preserves HITL", () => {
    const mapped = mapGovernedDischargeDraftEnvelope({
      patientEducationDraft: { status: "pending_physician_review" },
      dischargeDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        dischargeItems: [
          {
            slotKey: "discharge_condition_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "discharge_destination_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "discharge_medications_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "discharge_followup_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "discharge_precautions_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "discharge_notes_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-14T00:00:00.000Z",
      },
      governance: { ...GOVERNED_DISCHARGE_DRAFT_GOVERNANCE },
      reason: "governed_discharge_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.dischargeDraft.persisted, false);
    assert.equal(mapped.dischargeDraft.dischargeItems.length, 6);
    assert.equal(mapped.dischargeDraft.dischargeItems[0].value, null);
    assert.equal(mapGovernedDischargeDraftEnvelope(null), null);
  });
});

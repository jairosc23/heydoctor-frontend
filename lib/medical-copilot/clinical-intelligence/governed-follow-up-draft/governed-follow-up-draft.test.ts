import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_FOLLOW_UP_DRAFT_GOVERNANCE } from "./governed-follow-up-draft";
import { mapGovernedFollowUpDraftEnvelope } from "./governed-follow-up-draft-mapper";

describe("Phase 12 GovernedFollowUpDraft mapper", () => {
  it("maps empty structural follow-up slots and preserves HITL", () => {
    const mapped = mapGovernedFollowUpDraftEnvelope({
      patientInstructionsDraft: { status: "pending_physician_review" },
      followUpDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        followUpItems: [
          {
            slotKey: "follow_up_type_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "recommended_interval_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "monitoring_items_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "reevaluation_goals_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "pending_results_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "follow_up_notes_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_FOLLOW_UP_DRAFT_GOVERNANCE },
      reason: "governed_follow_up_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.followUpDraft.persisted, false);
    assert.equal(mapped.followUpDraft.followUpItems.length, 6);
    assert.equal(mapped.followUpDraft.followUpItems[0].value, null);
    assert.equal(mapGovernedFollowUpDraftEnvelope(null), null);
  });
});

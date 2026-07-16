import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_REFERRAL_DRAFT_GOVERNANCE } from "./governed-referral-draft";
import { mapGovernedReferralDraftEnvelope } from "./governed-referral-draft-mapper";

describe("Phase 8 GovernedReferralDraft mapper", () => {
  it("maps empty structural referral slots and preserves HITL", () => {
    const mapped = mapGovernedReferralDraftEnvelope({
      ordersDraft: { status: "pending_physician_review" },
      referralDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        referralItems: [
          { slotKey: "specialty_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "priority_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "reason_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "clinical_summary_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "attached_documents_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "destination_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_REFERRAL_DRAFT_GOVERNANCE },
      reason: "governed_referral_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.referralDraft.persisted, false);
    assert.equal(mapped.referralDraft.referralItems.length, 6);
    assert.equal(mapped.referralDraft.referralItems[0].value, null);
    assert.equal(mapGovernedReferralDraftEnvelope(null), null);
  });
});

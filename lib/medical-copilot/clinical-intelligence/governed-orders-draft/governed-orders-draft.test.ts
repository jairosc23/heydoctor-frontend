import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_ORDERS_DRAFT_GOVERNANCE } from "./governed-orders-draft";
import { mapGovernedOrdersDraftEnvelope } from "./governed-orders-draft-mapper";

describe("Phase 7 GovernedOrdersDraft mapper", () => {
  it("maps empty structural order slots and preserves HITL", () => {
    const mapped = mapGovernedOrdersDraftEnvelope({
      prescriptionDraft: { status: "pending_physician_review" },
      ordersDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        orderItems: [
          { slotKey: "laboratory_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "imaging_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "procedure_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "referral_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "monitoring_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
          { slotKey: "followup_slot", status: "empty_structural_slot", value: null, readOnly: true, persisted: false },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_ORDERS_DRAFT_GOVERNANCE },
      reason: "governed_orders_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.ordersDraft.persisted, false);
    assert.equal(mapped.ordersDraft.orderItems.length, 6);
    assert.equal(mapped.ordersDraft.orderItems[0].value, null);
    assert.equal(mapGovernedOrdersDraftEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CARE_PLAN_DRAFT_GOVERNANCE } from "./governed-care-plan-draft";
import { mapGovernedCarePlanDraftEnvelope } from "./governed-care-plan-draft-mapper";

describe("Phase 14 GovernedCarePlanDraft mapper", () => {
  it("maps empty structural care plan slots and preserves HITL", () => {
    const mapped = mapGovernedCarePlanDraftEnvelope({
      clinicalVisitSummaryDraft: { status: "pending_physician_review" },
      carePlanDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        carePlanItems: [
          {
            slotKey: "primary_goal_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "secondary_goals_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "planned_interventions_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "monitoring_strategy_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "review_schedule_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "care_plan_notes_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-14T00:00:00.000Z",
      },
      governance: { ...GOVERNED_CARE_PLAN_DRAFT_GOVERNANCE },
      reason: "governed_care_plan_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.carePlanDraft.persisted, false);
    assert.equal(mapped.carePlanDraft.carePlanItems.length, 6);
    assert.equal(mapped.carePlanDraft.carePlanItems[0].value, null);
    assert.equal(mapGovernedCarePlanDraftEnvelope(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_VISIT_SUMMARY_DRAFT_GOVERNANCE } from "./governed-clinical-visit-summary-draft";
import { mapGovernedClinicalVisitSummaryDraftEnvelope } from "./governed-clinical-visit-summary-draft-mapper";

describe("Phase 13 GovernedClinicalVisitSummaryDraft mapper", () => {
  it("maps empty structural summary slots and preserves HITL", () => {
    const mapped = mapGovernedClinicalVisitSummaryDraftEnvelope({
      followUpDraft: { status: "pending_physician_review" },
      clinicalVisitSummaryDraft: {
        status: "pending_physician_review",
        draftApproved: false,
        readOnly: true,
        persisted: false,
        summaryItems: [
          {
            slotKey: "consultation_reason_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "clinical_findings_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "assessment_reference_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "performed_actions_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "follow_up_reference_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
          {
            slotKey: "closing_summary_slot",
            status: "empty_structural_slot",
            value: null,
            readOnly: true,
            persisted: false,
          },
        ],
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_CLINICAL_VISIT_SUMMARY_DRAFT_GOVERNANCE },
      reason:
        "governed_clinical_visit_summary_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.clinicalVisitSummaryDraft.persisted, false);
    assert.equal(mapped.clinicalVisitSummaryDraft.summaryItems.length, 6);
    assert.equal(mapped.clinicalVisitSummaryDraft.summaryItems[0].value, null);
    assert.equal(mapGovernedClinicalVisitSummaryDraftEnvelope(null), null);
  });
});

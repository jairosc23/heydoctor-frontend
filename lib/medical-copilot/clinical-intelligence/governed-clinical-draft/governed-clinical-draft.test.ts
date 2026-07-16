import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_DRAFT_GOVERNANCE } from "./governed-clinical-draft";
import { mapGovernedClinicalDraftEnvelope } from "./governed-clinical-draft-mapper";

describe("Phase 4 GovernedClinicalDraft mapper", () => {
  it("maps composite envelope and preserves HITL / unapproved draft", () => {
    const mapped = mapGovernedClinicalDraftEnvelope({
      assistance: { hitl: { status: "awaiting_physician_review" } },
      runtime: { foundation: { source: "governed_clinical_intelligence_foundation" } },
      clinicalOutput: { source: "governed_clinical_ai_output" },
      reviewSession: { source: "governed_review_session" },
      decisionWorkspace: { source: "physician_decision_workspace" },
      draft: {
        status: "pending_physician_review",
        draftApproved: false,
        requiresPhysicianReview: true,
        executesAction: false,
        autoPersistedToEmr: false,
        persisted: false,
        readOnly: true,
        available: true,
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
      governance: { ...GOVERNED_CLINICAL_DRAFT_GOVERNANCE },
      reason: "governed_clinical_draft_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.draft.draftApproved, false);
    assert.equal(mapped.draft.persisted, false);
    assert.equal(mapped.draft.readOnly, true);
    assert.equal(mapped.draft.available, true);
    assert.equal(mapGovernedClinicalDraftEnvelope(null), null);
  });
});

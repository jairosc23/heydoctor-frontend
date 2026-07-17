import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_SOAP_DRAFT_GOVERNANCE } from "./governed-soap-draft";
import { mapGovernedSoapDraftEnvelope } from "./governed-soap-draft-mapper";

describe("Phase 5 GovernedSoapDraft mapper", () => {
  it("maps structural SOAP slots and preserves HITL", () => {
    const mapped = mapGovernedSoapDraftEnvelope({
      clinicalDraft: { draft: { available: true } },
      subjective: {
        section: "subjective",
        status: "empty_structural_slot",
        items: [],
        sourceRef: "clinical_context",
        readOnly: true,
        persisted: false,
      },
      objective: {
        section: "objective",
        status: "empty_structural_slot",
        items: [],
        sourceRef: "clinical_context",
        readOnly: true,
        persisted: false,
      },
      assessment: {
        section: "assessment",
        status: "empty_structural_slot",
        items: [],
        sourceRef: "clinical_plan",
        readOnly: true,
        persisted: false,
      },
      plan: {
        section: "plan",
        status: "empty_structural_slot",
        items: [],
        sourceRef: "clinical_plan",
        readOnly: true,
        persisted: false,
      },
      governance: { ...GOVERNED_SOAP_DRAFT_GOVERNANCE },
      reason: "governed_soap_draft_structural_slots_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.subjective.persisted, false);
    assert.equal(mapped.plan.readOnly, true);
    assert.equal(mapped.assessment.items.length, 0);
    assert.equal(mapGovernedSoapDraftEnvelope(null), null);
  });
});

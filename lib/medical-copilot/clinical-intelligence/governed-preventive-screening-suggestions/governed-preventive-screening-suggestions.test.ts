import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE } from "./governed-preventive-screening-suggestions";
import { mapGovernedPreventiveScreeningSuggestionsEnvelope } from "./governed-preventive-screening-suggestions-mapper";

describe("GovernedPreventiveScreeningSuggestions mapper", () => {
  it("maps HITL intelligence surface without write flags", () => {
    const mapped = mapGovernedPreventiveScreeningSuggestionsEnvelope({
      status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
      title: "Governed Preventive Screening Suggestions",
      kind: "intelligence",
      items: [{ id: "1", label: "slot", approved: false, persisted: false, executable: false, automaticDecision: false }],
      governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_UI_GOVERNANCE },
      reason: "proposed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.repositoryInvoked, false);
    assert.equal(mapped.executesAction, false);
    assert.equal(mapped.draftApproved, false);
    assert.equal(mapped.automaticDecision, false);
    assert.ok(mapped.components.some((c) => c.key === "hitl" && c.present));
    assert.equal(mapGovernedPreventiveScreeningSuggestionsEnvelope(null), null);
  });
});

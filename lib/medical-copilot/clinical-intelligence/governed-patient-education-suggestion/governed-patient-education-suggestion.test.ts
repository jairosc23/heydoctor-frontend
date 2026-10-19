import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE } from "./governed-patient-education-suggestion";
import { mapGovernedPatientEducationSuggestionEnvelope } from "./governed-patient-education-suggestion-mapper";

describe("GovernedPatientEducationSuggestion mapper", () => {
  it("maps HITL suggestion surface without write flags", () => {
    const mapped = mapGovernedPatientEducationSuggestionEnvelope({
      status: "PROPOSED_FOR_PHYSICIAN_REVIEW",
      title: "Governed Patient Education Suggestion",
      kind: "patient_education",
      items: [{ id: "1", label: "slot", approved: false, persisted: false, executable: false }],
      governance: { ...GOVERNED_CLINICAL_SUGGESTIONS_UI_GOVERNANCE },
      reason: "proposed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.repositoryInvoked, false);
    assert.equal(mapped.executesAction, false);
    assert.equal(mapped.draftApproved, false);
    assert.ok(mapped.components.some((c) => c.key === "hitl" && c.present));
    assert.equal(mapGovernedPatientEducationSuggestionEnvelope(null), null);
  });
});

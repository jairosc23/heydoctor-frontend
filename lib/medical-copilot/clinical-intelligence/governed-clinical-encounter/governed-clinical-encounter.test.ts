import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ENCOUNTER_GOVERNANCE } from "./governed-clinical-encounter";
import { mapGovernedClinicalEncounterEnvelope } from "./governed-clinical-encounter-mapper";

describe("Phase 18 GovernedClinicalEncounter mapper", () => {
  it("maps encounter composition presence and preserves HITL", () => {
    const mapped = mapGovernedClinicalEncounterEnvelope({
      documentationPackage: { clinicalDraft: { status: "pending_physician_review" } },
      clinicalAssistance: { status: "ok" },
      intelligenceRuntime: { status: "ok" },
      clinicalContext: { contextItems: [] },
      clinicalPlan: { planItems: [] },
      clinicalOutput: { status: "ok" },
      reviewSession: { status: "pending_physician_review" },
      physicianDecisionWorkspace: { status: "ok" },
      governance: { ...GOVERNED_CLINICAL_ENCOUNTER_GOVERNANCE },
      reason: "governed_clinical_encounter_composed_for_physician_review",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.draftApproved, false);
    assert.equal(mapped.components.length, 8);
    assert.ok(mapped.components.every((c) => c.present));
    assert.ok(mapped.components.every((c) => c.readOnly));
    assert.ok(mapped.components.every((c) => !c.persisted));
    assert.equal(mapGovernedClinicalEncounterEnvelope(null), null);
  });
});

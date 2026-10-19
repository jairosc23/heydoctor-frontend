import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ASSISTANCE_GOVERNANCE } from "./governed-clinical-assistance";
import { mapGovernedClinicalAssistanceEnvelope } from "./governed-clinical-assistance-mapper";

describe("Phase 3 GovernedClinicalAssistance mapper", () => {
  it("maps composite envelope and preserves HITL", () => {
    const mapped = mapGovernedClinicalAssistanceEnvelope({
      runtime: { foundation: { source: "governed_clinical_intelligence_foundation" } },
      clinicalContext: { source: "clinical_context_engine" },
      clinicalPlan: { source: "clinical_planning_engine" },
      clinicalOutput: { source: "governed_clinical_ai_output" },
      decisionWorkspace: { source: "physician_decision_workspace" },
      reviewSession: { source: "governed_review_session" },
      governance: { ...GOVERNED_CLINICAL_ASSISTANCE_GOVERNANCE },
      reason: "governed_clinical_assistance_composed",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.hitl.status, "awaiting_physician_review");
    assert.equal(mapped.reason, "governed_clinical_assistance_composed");
    assert.equal(mapGovernedClinicalAssistanceEnvelope(null), null);
  });
});

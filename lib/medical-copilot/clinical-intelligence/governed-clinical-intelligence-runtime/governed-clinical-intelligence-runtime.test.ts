import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE } from "./governed-clinical-intelligence-runtime";
import { mapGovernedClinicalIntelligenceRuntimeEnvelope } from "./governed-clinical-intelligence-runtime-mapper";

describe("Phase 2 GovernedClinicalIntelligenceRuntime mapper", () => {
  it("maps composite envelope and preserves HITL", () => {
    const mapped = mapGovernedClinicalIntelligenceRuntimeEnvelope({
      foundation: { source: "governed_clinical_intelligence_foundation" },
      providerExecution: { source: "governed_provider_execution" },
      processedResponse: { source: "governed_ai_response_processing" },
      clinicalOutput: { source: "governed_clinical_ai_output" },
      physicianReview: { source: "governed_physician_review_experience" },
      governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE },
      reason: "governed_clinical_intelligence_runtime_composed",
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(
      mapped.reason,
      "governed_clinical_intelligence_runtime_composed",
    );
    assert.equal(mapGovernedClinicalIntelligenceRuntimeEnvelope(null), null);
  });
});

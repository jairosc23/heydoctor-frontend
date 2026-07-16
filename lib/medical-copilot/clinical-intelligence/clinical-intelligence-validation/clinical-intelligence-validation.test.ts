import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_VALIDATION_GOVERNANCE, type ClinicalIntelligenceValidation } from "./clinical-intelligence-validation";
import { mapClinicalIntelligenceValidation, mapClinicalIntelligenceValidationEnvelope } from "./clinical-intelligence-validation-mapper";
describe("AI-92 ClinicalIntelligenceValidation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceValidation = {
      clinicalIntelligenceValidationId: "id1", providerId: "openai", validationSlots: [], governance: { ...CLINICAL_INTELLIGENCE_VALIDATION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        physicianIntelligenceWorkspaceId: "x",
        clinicalConsistencyEngineId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceValidationEnvelope({ clinicalIntelligenceValidation: { source: "clinical_intelligence_validation", builderVersion: "1.0.0", clinicalIntelligenceValidation: model, governance: { ...CLINICAL_INTELLIGENCE_VALIDATION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceValidation(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_OUTPUT_GOVERNANCE, type ClinicalIntelligenceOutput } from "./clinical-intelligence-output";
import { mapClinicalIntelligenceOutput, mapClinicalIntelligenceOutputEnvelope } from "./clinical-intelligence-output-mapper";
describe("AI-94 ClinicalIntelligenceOutput mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceOutput = {
      clinicalIntelligenceOutputId: "id1", providerId: "openai", outputSlots: [], governance: { ...CLINICAL_INTELLIGENCE_OUTPUT_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedClinicalIntelligenceSessionId: "x",
        clinicalIntelligenceRuntimeId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceOutputEnvelope({ clinicalIntelligenceOutput: { source: "clinical_intelligence_output", builderVersion: "1.0.0", clinicalIntelligenceOutput: model, governance: { ...CLINICAL_INTELLIGENCE_OUTPUT_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceOutput(null), null);
  });
});

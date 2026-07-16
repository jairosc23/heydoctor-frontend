import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_CONFIDENCE_GOVERNANCE, type ClinicalConfidenceFoundation } from "./clinical-confidence-foundation";
import { mapClinicalConfidenceFoundation, mapClinicalConfidenceFoundationEnvelope } from "./clinical-confidence-foundation-mapper";

describe("AI-23 ClinicalConfidenceFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalConfidenceFoundation = {
      confidenceId: "id1",
      providerId: "openai",
      confidenceSlots: [],
      governance: { ...CLINICAL_CONFIDENCE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        differentialId: "x",
        evidenceMappingId: "x",
        evidenceCoverage: "x",
        completeness: "x",
        missingInformation: "x",
        structuralConfidence: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalConfidenceFoundationEnvelope({
      confidence: {
        source: "clinical_confidence_foundation",
        builderVersion: "1.0.0",
        confidence: model,
        governance: { ...CLINICAL_CONFIDENCE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalConfidenceFoundation(null), null);
  });
});

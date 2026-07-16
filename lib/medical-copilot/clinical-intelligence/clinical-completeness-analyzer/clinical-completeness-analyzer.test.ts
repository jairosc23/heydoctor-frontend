import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_COMPLETENESS_ANALYZER_GOVERNANCE, type ClinicalCompletenessAnalyzerResult } from "./clinical-completeness-analyzer";
import { mapClinicalCompletenessAnalyzerResult, mapClinicalCompletenessAnalyzerResultEnvelope } from "./clinical-completeness-analyzer-mapper";

describe("AI-43 ClinicalCompletenessAnalyzerResult mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalCompletenessAnalyzerResult = {
      completenessId: "id1",
      providerId: "openai",
      completenessSlots: [],
      governance: { ...CLINICAL_COMPLETENESS_ANALYZER_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        interviewWorkspaceId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        structuralCompleteness: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalCompletenessAnalyzerResultEnvelope({
      completeness: {
        source: "clinical_completeness_analyzer",
        builderVersion: "1.0.0",
        completeness: model,
        governance: { ...CLINICAL_COMPLETENESS_ANALYZER_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalCompletenessAnalyzerResult(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_PIPELINE_GOVERNANCE, type ClinicalReasoningPipeline } from "./clinical-reasoning-pipeline";
import { mapClinicalReasoningPipeline, mapClinicalReasoningPipelineEnvelope } from "./clinical-reasoning-pipeline-mapper";
describe("AI-71 ClinicalReasoningPipeline mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningPipeline = {
      clinicalReasoningPipelineId: "id1", providerId: "openai", pipelineSlots: [], governance: { ...CLINICAL_REASONING_PIPELINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningRuntimeFoundationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningPipelineEnvelope({ clinicalReasoningPipeline: { source: "clinical_reasoning_pipeline", builderVersion: "1.0.0", clinicalReasoningPipeline: model, governance: { ...CLINICAL_REASONING_PIPELINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningPipeline(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_TRACE_GOVERNANCE, type ClinicalIntelligenceTrace } from "./clinical-intelligence-trace";
import { mapClinicalIntelligenceTrace, mapClinicalIntelligenceTraceEnvelope } from "./clinical-intelligence-trace-mapper";
describe("AI-89 ClinicalIntelligenceTrace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceTrace = {
      clinicalIntelligenceTraceId: "id1", providerId: "openai", traceSlots: [], governance: { ...CLINICAL_INTELLIGENCE_TRACE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceGraphId: "x",
        governedReasoningOutputId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceTraceEnvelope({ clinicalIntelligenceTrace: { source: "clinical_intelligence_trace", builderVersion: "1.0.0", clinicalIntelligenceTrace: model, governance: { ...CLINICAL_INTELLIGENCE_TRACE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceTrace(null), null);
  });
});

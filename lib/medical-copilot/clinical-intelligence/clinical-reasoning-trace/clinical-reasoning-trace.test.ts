import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_TRACE_GOVERNANCE, type ClinicalReasoningTrace } from "./clinical-reasoning-trace";
import { mapClinicalReasoningTrace, mapClinicalReasoningTraceEnvelope } from "./clinical-reasoning-trace-mapper";
describe("AI-73 ClinicalReasoningTrace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningTrace = {
      clinicalReasoningTraceId: "id1", providerId: "openai", traceSlots: [], governance: { ...CLINICAL_REASONING_TRACE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningGraphId: "x",
        reasoningExecutionContextId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningTraceEnvelope({ clinicalReasoningTrace: { source: "clinical_reasoning_trace", builderVersion: "1.0.0", clinicalReasoningTrace: model, governance: { ...CLINICAL_REASONING_TRACE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningTrace(null), null);
  });
});

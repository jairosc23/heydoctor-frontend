import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE, type ClinicalIntelligenceRuntime } from "./clinical-intelligence-runtime";
import { mapClinicalIntelligenceRuntime, mapClinicalIntelligenceRuntimeEnvelope } from "./clinical-intelligence-runtime-mapper";
describe("AI-90 ClinicalIntelligenceRuntime mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceRuntime = {
      clinicalIntelligenceRuntimeId: "id1", providerId: "openai", runtimeSlots: [], governance: { ...CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceTraceId: "x",
        clinicalReasoningRuntimeFoundationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceRuntimeEnvelope({ clinicalIntelligenceRuntime: { source: "clinical_intelligence_runtime", builderVersion: "1.0.0", clinicalIntelligenceRuntime: model, governance: { ...CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceRuntime(null), null);
  });
});

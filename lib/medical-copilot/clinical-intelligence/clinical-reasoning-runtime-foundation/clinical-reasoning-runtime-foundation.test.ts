import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE, type ClinicalReasoningRuntimeFoundation } from "./clinical-reasoning-runtime-foundation";
import { mapClinicalReasoningRuntimeFoundation, mapClinicalReasoningRuntimeFoundationEnvelope } from "./clinical-reasoning-runtime-foundation-mapper";
describe("AI-70 ClinicalReasoningRuntimeFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningRuntimeFoundation = {
      clinicalReasoningRuntimeFoundationId: "id1", providerId: "openai", runtimeFoundationSlots: [], governance: { ...CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedReasoningSessionId: "x",
        clinicalReasoningEngineFoundationId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningRuntimeFoundationEnvelope({ clinicalReasoningRuntimeFoundation: { source: "clinical_reasoning_runtime_foundation", builderVersion: "1.0.0", clinicalReasoningRuntimeFoundation: model, governance: { ...CLINICAL_REASONING_RUNTIME_FOUNDATION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningRuntimeFoundation(null), null);
  });
});

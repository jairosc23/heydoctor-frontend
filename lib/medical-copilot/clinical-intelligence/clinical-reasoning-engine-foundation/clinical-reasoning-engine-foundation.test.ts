import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE, type ClinicalReasoningEngineFoundation } from "./clinical-reasoning-engine-foundation";
import { mapClinicalReasoningEngineFoundation, mapClinicalReasoningEngineFoundationEnvelope } from "./clinical-reasoning-engine-foundation-mapper";
describe("AI-65 ClinicalReasoningEngineFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningEngineFoundation = {
      clinicalReasoningEngineFoundationId: "id1", providerId: "openai", foundationSlots: [], governance: { ...CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedReasoningRuntimeId: "x",
        clinicalReasoningInputPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningEngineFoundationEnvelope({ clinicalReasoningEngineFoundation: { source: "clinical_reasoning_engine_foundation", builderVersion: "1.0.0", clinicalReasoningEngineFoundation: model, governance: { ...CLINICAL_REASONING_ENGINE_FOUNDATION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningEngineFoundation(null), null);
  });
});

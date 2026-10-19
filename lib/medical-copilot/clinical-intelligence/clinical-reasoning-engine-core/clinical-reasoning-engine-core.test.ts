import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE, type ClinicalReasoningEngineCore } from "./clinical-reasoning-engine-core";
import { mapClinicalReasoningEngineCore, mapClinicalReasoningEngineCoreEnvelope } from "./clinical-reasoning-engine-core-mapper";
describe("AI-61 ClinicalReasoningEngineCore mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningEngineCore = {
      clinicalReasoningEngineCoreId: "id1", providerId: "openai", engineCoreSlots: [], governance: { ...CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningInputPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningEngineCoreEnvelope({ clinicalReasoningEngineCore: { source: "clinical_reasoning_engine_core", builderVersion: "1.0.0", clinicalReasoningEngineCore: model, governance: { ...CLINICAL_REASONING_ENGINE_CORE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningEngineCore(null), null);
  });
});

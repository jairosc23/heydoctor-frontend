import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_CONSISTENCY_ENGINE_GOVERNANCE, type ClinicalConsistencyEngine } from "./clinical-consistency-engine";
import { mapClinicalConsistencyEngine, mapClinicalConsistencyEngineEnvelope } from "./clinical-consistency-engine-mapper";
describe("AI-79 ClinicalConsistencyEngine mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalConsistencyEngine = {
      clinicalConsistencyEngineId: "id1", providerId: "openai", consistencySlots: [], governance: { ...CLINICAL_CONSISTENCY_ENGINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        evidenceReasoningEngineId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalConsistencyEngineEnvelope({ clinicalConsistencyEngine: { source: "clinical_consistency_engine", builderVersion: "1.0.0", clinicalConsistencyEngine: model, governance: { ...CLINICAL_CONSISTENCY_ENGINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalConsistencyEngine(null), null);
  });
});

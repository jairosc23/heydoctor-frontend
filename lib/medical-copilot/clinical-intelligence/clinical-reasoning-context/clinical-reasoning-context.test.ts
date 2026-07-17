import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_CONTEXT_GOVERNANCE, type ClinicalReasoningContext } from "./clinical-reasoning-context";
import { mapClinicalReasoningContext, mapClinicalReasoningContextEnvelope } from "./clinical-reasoning-context-mapper";
describe("AI-56 ClinicalReasoningContext mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningContext = {
      clinicalReasoningContextId: "id1", providerId: "openai", contextSlots: [], governance: { ...CLINICAL_REASONING_CONTEXT_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedClinicalReasoningDatasetId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningContextEnvelope({ clinicalReasoningContext: { source: "clinical_reasoning_context", builderVersion: "1.0.0", clinicalReasoningContext: model, governance: { ...CLINICAL_REASONING_CONTEXT_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningContext(null), null);
  });
});

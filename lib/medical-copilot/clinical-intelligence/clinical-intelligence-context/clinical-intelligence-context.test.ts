import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_CONTEXT_GOVERNANCE, type ClinicalIntelligenceContext } from "./clinical-intelligence-context";
import { mapClinicalIntelligenceContext, mapClinicalIntelligenceContextEnvelope } from "./clinical-intelligence-context-mapper";
describe("AI-87 ClinicalIntelligenceContext mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceContext = {
      clinicalIntelligenceContextId: "id1", providerId: "openai", contextSlots: [], governance: { ...CLINICAL_INTELLIGENCE_CONTEXT_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceOrchestratorId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceContextEnvelope({ clinicalIntelligenceContext: { source: "clinical_intelligence_context", builderVersion: "1.0.0", clinicalIntelligenceContext: model, governance: { ...CLINICAL_INTELLIGENCE_CONTEXT_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceContext(null), null);
  });
});

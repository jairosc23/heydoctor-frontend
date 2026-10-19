import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE, type ClinicalIntelligenceOrchestrator } from "./clinical-intelligence-orchestrator";
import { mapClinicalIntelligenceOrchestrator, mapClinicalIntelligenceOrchestratorEnvelope } from "./clinical-intelligence-orchestrator-mapper";
describe("AI-86 ClinicalIntelligenceOrchestrator mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceOrchestrator = {
      clinicalIntelligenceOrchestratorId: "id1", providerId: "openai", orchestratorSlots: [], governance: { ...CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        governedClinicalIntelligencePackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceOrchestratorEnvelope({ clinicalIntelligenceOrchestrator: { source: "clinical_intelligence_orchestrator", builderVersion: "1.0.0", clinicalIntelligenceOrchestrator: model, governance: { ...CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceOrchestrator(null), null);
  });
});

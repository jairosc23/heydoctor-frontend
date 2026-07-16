import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_INTELLIGENCE_GRAPH_GOVERNANCE, type ClinicalIntelligenceGraph } from "./clinical-intelligence-graph";
import { mapClinicalIntelligenceGraph, mapClinicalIntelligenceGraphEnvelope } from "./clinical-intelligence-graph-mapper";
describe("AI-88 ClinicalIntelligenceGraph mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalIntelligenceGraph = {
      clinicalIntelligenceGraphId: "id1", providerId: "openai", graphSlots: [], governance: { ...CLINICAL_INTELLIGENCE_GRAPH_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceContextId: "x",
        evidenceReasoningEngineId: "x",
        clinicalReasoningGraphId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalIntelligenceGraphEnvelope({ clinicalIntelligenceGraph: { source: "clinical_intelligence_graph", builderVersion: "1.0.0", clinicalIntelligenceGraph: model, governance: { ...CLINICAL_INTELLIGENCE_GRAPH_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalIntelligenceGraph(null), null);
  });
});

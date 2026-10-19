import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_GRAPH_GOVERNANCE, type ClinicalReasoningGraph } from "./clinical-reasoning-graph";
import { mapClinicalReasoningGraph, mapClinicalReasoningGraphEnvelope } from "./clinical-reasoning-graph-mapper";
describe("AI-72 ClinicalReasoningGraph mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningGraph = {
      clinicalReasoningGraphId: "id1", providerId: "openai", graphSlots: [], governance: { ...CLINICAL_REASONING_GRAPH_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningPipelineId: "x",
        evidenceGraphWorkspaceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapClinicalReasoningGraphEnvelope({ clinicalReasoningGraph: { source: "clinical_reasoning_graph", builderVersion: "1.0.0", clinicalReasoningGraph: model, governance: { ...CLINICAL_REASONING_GRAPH_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningGraph(null), null);
  });
});

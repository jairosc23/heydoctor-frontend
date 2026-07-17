import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapGovernedPersistenceAggregatorEnvelope } from "./governed-persistence-aggregator-mapper";
describe("Persistence Aggregator", () => {
  it("maps orchestrator envelope with HITL seals", () => {
    const mapped = mapGovernedPersistenceAggregatorEnvelope({ status: "ok", data: {
      status: "READY_FOR_PHYSICIAN_REVIEW", aggregatorCount: 1,
      aggregators: [{ order: 1, kind: "knowledge_aggregator", title: "Knowledge Aggregator", summary: "s", sourcePackages: ["governed_clinical_knowledge_package"], surfaceRefs: [{ sourcePackage: "governed_clinical_knowledge_package", surfaceKind: "knowledge_engines", metricLabel: "engineCount", metricValue: 29 }] }],
      certifiedSourcesIntegrated: ["governed_clinical_knowledge_package"],
      generatesNewClinicalContent: false, usesLlm: false,
      governance: { requiresPhysicianReview: true, usesLlm: false, generatesNewClinicalContent: false },
    }});
    assert.ok(mapped);
    assert.equal(mapped!.usesLlm, false);
    assert.equal(mapped!.generatesNewClinicalContent, false);
    assert.equal(mapped!.aggregators.length, 1);
  });
});

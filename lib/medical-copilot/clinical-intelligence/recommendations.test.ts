import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_RECOMMENDATION_GOVERNANCE,
  type ClinicalRecommendation,
} from "./recommendations";
import {
  buildRecommendationCollection,
  mapRecommendation,
  mapRecommendationsEnvelope,
} from "./recommendations-mapper";

describe("CI-3 Clinical Recommendations mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const recommendation: ClinicalRecommendation = {
      id: "r1",
      category: "workspace",
      priority: "high",
      source: "clinical_insights",
      confidence: 0.85,
      summary: "Revisar 2 insights (workspace): Artefacto",
      insightIds: ["i1", "i2"],
      references: [{ kind: "workspace", id: "art-1" }],
      governance: { ...CLINICAL_RECOMMENDATION_GOVERNANCE },
    };

    const mapped = mapRecommendationsEnvelope({
      recommendations: {
        source: "clinical_recommendation_engine",
        engineVersion: "1.0.0",
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        status: "ok",
        collection: {
          recommendations: [recommendation],
          byCategory: {},
          byPriority: {},
          count: 1,
        },
        governance: { ...CLINICAL_RECOMMENDATION_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.status, "ok");
    assert.equal(mapped.collection.count, 1);
    assert.equal(mapped.collection.recommendations[0].insightIds.length, 2);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid recommendation payloads", () => {
    assert.equal(mapRecommendation(null), null);
    assert.equal(mapRecommendation({ id: "x", summary: "y" }), null);
  });

  it("groups recommendations by category and priority", () => {
    const collection = buildRecommendationCollection([
      {
        id: "1",
        category: "workspace",
        priority: "urgent",
        source: "clinical_insights",
        confidence: 1,
        summary: "a",
        insightIds: ["i1"],
        references: [],
        governance: { ...CLINICAL_RECOMMENDATION_GOVERNANCE },
      },
      {
        id: "2",
        category: "timeline",
        priority: "low",
        source: "clinical_insights",
        confidence: 1,
        summary: "b",
        insightIds: ["i2"],
        references: [],
        governance: { ...CLINICAL_RECOMMENDATION_GOVERNANCE },
      },
    ]);
    assert.equal(collection.count, 2);
    assert.equal(collection.byCategory.workspace?.length, 1);
    assert.equal(collection.byPriority.urgent?.length, 1);
  });
});

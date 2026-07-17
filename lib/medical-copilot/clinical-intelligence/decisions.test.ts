import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_DECISION_SUPPORT_GOVERNANCE,
  type ClinicalDecision,
} from "./decisions";
import {
  buildDecisionCollection,
  mapDecision,
  mapDecisionsEnvelope,
} from "./decisions-mapper";

describe("CI-4 Clinical Decision Support mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const decision: ClinicalDecision = {
      id: "d1",
      category: "workspace",
      priority: "high",
      source: "clinical_recommendations",
      confidence: 0.85,
      summary: "Decisión (revisión) 2 recomendaciones (workspace): Revisar",
      recommendationIds: ["r1", "r2"],
      references: [{ kind: "workspace", id: "art-1" }],
      governance: { ...CLINICAL_DECISION_SUPPORT_GOVERNANCE },
    };

    const mapped = mapDecisionsEnvelope({
      decisions: {
        source: "clinical_decision_support_engine",
        engineVersion: "1.0.0",
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        status: "ok",
        collection: {
          decisions: [decision],
          byCategory: {},
          byPriority: {},
          count: 1,
        },
        governance: { ...CLINICAL_DECISION_SUPPORT_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.status, "ok");
    assert.equal(mapped.collection.count, 1);
    assert.equal(mapped.collection.decisions[0].recommendationIds.length, 2);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid decision payloads", () => {
    assert.equal(mapDecision(null), null);
    assert.equal(mapDecision({ id: "x", summary: "y" }), null);
  });

  it("groups decisions by category and priority", () => {
    const collection = buildDecisionCollection([
      {
        id: "1",
        category: "workspace",
        priority: "urgent",
        source: "clinical_recommendations",
        confidence: 1,
        summary: "a",
        recommendationIds: ["r1"],
        references: [],
        governance: { ...CLINICAL_DECISION_SUPPORT_GOVERNANCE },
      },
      {
        id: "2",
        category: "timeline",
        priority: "low",
        source: "clinical_recommendations",
        confidence: 1,
        summary: "b",
        recommendationIds: ["r2"],
        references: [],
        governance: { ...CLINICAL_DECISION_SUPPORT_GOVERNANCE },
      },
    ]);
    assert.equal(collection.count, 2);
    assert.equal(collection.byCategory.workspace?.length, 1);
    assert.equal(collection.byPriority.urgent?.length, 1);
  });
});

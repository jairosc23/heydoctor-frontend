import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_INSIGHT_GOVERNANCE,
  type ClinicalInsight,
} from "./insights";
import {
  buildInsightCollection,
  mapInsight,
  mapInsightsEnvelope,
} from "./insights-mapper";

describe("CI-2 Clinical Insights mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const insight: ClinicalInsight = {
      id: "i1",
      category: "workspace",
      severity: "medium",
      source: "clinical_findings",
      confidence: 0.85,
      summary: "2 hallazgos (workspace): Artefacto",
      findingIds: ["f1", "f2"],
      references: [{ kind: "workspace", id: "art-1" }],
      governance: { ...CLINICAL_INSIGHT_GOVERNANCE },
    };

    const mapped = mapInsightsEnvelope({
      insights: {
        source: "clinical_insight_engine",
        engineVersion: "1.0.0",
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        status: "ok",
        collection: {
          insights: [insight],
          byCategory: {},
          bySeverity: {},
          count: 1,
        },
        governance: { ...CLINICAL_INSIGHT_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.status, "ok");
    assert.equal(mapped.collection.count, 1);
    assert.equal(mapped.collection.insights[0].findingIds.length, 2);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid insight payloads", () => {
    assert.equal(mapInsight(null), null);
    assert.equal(mapInsight({ id: "x", summary: "y" }), null);
  });

  it("groups insights by category and severity", () => {
    const collection = buildInsightCollection([
      {
        id: "1",
        category: "workspace",
        severity: "high",
        source: "clinical_findings",
        confidence: 1,
        summary: "a",
        findingIds: ["f1"],
        references: [],
        governance: { ...CLINICAL_INSIGHT_GOVERNANCE },
      },
      {
        id: "2",
        category: "timeline",
        severity: "info",
        source: "clinical_findings",
        confidence: 1,
        summary: "b",
        findingIds: ["f2"],
        references: [],
        governance: { ...CLINICAL_INSIGHT_GOVERNANCE },
      },
    ]);
    assert.equal(collection.count, 2);
    assert.equal(collection.byCategory.workspace?.length, 1);
    assert.equal(collection.bySeverity.high?.length, 1);
  });
});

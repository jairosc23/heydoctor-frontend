import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_INTELLIGENCE_GOVERNANCE,
  type ClinicalFinding,
} from "./findings";
import {
  buildCollection,
  mapFinding,
  mapIntelligenceEnvelope,
} from "./findings-mapper";

describe("CI-1 Clinical Findings mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const finding: ClinicalFinding = {
      id: "f1",
      category: "timeline",
      severity: "medium",
      source: "timeline",
      confidence: 0.8,
      summary: "Evento timeline",
      references: [{ kind: "timeline", id: "te-1" }],
      governance: { ...CLINICAL_INTELLIGENCE_GOVERNANCE },
    };

    const mapped = mapIntelligenceEnvelope({
      intelligence: {
        source: "clinical_intelligence_engine",
        engineVersion: "1.0.0",
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        status: "ok",
        collection: {
          findings: [finding],
          byCategory: {},
          bySeverity: {},
          count: 1,
        },
        governance: { ...CLINICAL_INTELLIGENCE_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.status, "ok");
    assert.equal(mapped.collection.count, 1);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid finding payloads", () => {
    assert.equal(mapFinding(null), null);
    assert.equal(mapFinding({ id: "x" }), null);
  });

  it("groups findings by category and severity", () => {
    const collection = buildCollection([
      {
        id: "1",
        category: "workspace",
        severity: "high",
        source: "workspace",
        confidence: 1,
        summary: "a",
        references: [],
        governance: { ...CLINICAL_INTELLIGENCE_GOVERNANCE },
      },
      {
        id: "2",
        category: "workspace",
        severity: "info",
        source: "workspace",
        confidence: 1,
        summary: "b",
        references: [],
        governance: { ...CLINICAL_INTELLIGENCE_GOVERNANCE },
      },
    ]);
    assert.equal(collection.byCategory.workspace?.length, 2);
    assert.equal(collection.bySeverity.high?.length, 1);
  });
});

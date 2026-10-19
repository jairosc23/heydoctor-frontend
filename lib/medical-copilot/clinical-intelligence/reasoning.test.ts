import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GOVERNED_CLINICAL_REASONING_GOVERNANCE,
  type ClinicalReasoning,
} from "./reasoning";
import {
  buildReasoningCollection,
  mapReasoning,
  mapReasoningEnvelope,
} from "./reasoning-mapper";

describe("CI-5 Governed Clinical Reasoning mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const reasoning: ClinicalReasoning = {
      id: "rr1",
      category: "workspace",
      confidence: 0.85,
      source: "clinical_decisions",
      summary: "Razonamiento gobernado 2 decisiones (workspace): Decisión",
      decisionIds: ["d1", "d2"],
      references: [{ kind: "workspace", id: "art-1" }],
      governance: { ...GOVERNED_CLINICAL_REASONING_GOVERNANCE },
    };

    const mapped = mapReasoningEnvelope({
      reasoning: {
        source: "governed_clinical_reasoning_engine",
        engineVersion: "1.0.0",
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        status: "ok",
        collection: {
          reasonings: [reasoning],
          byCategory: {},
          count: 1,
        },
        governance: { ...GOVERNED_CLINICAL_REASONING_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.status, "ok");
    assert.equal(mapped.collection.count, 1);
    assert.equal(mapped.collection.reasonings[0].decisionIds.length, 2);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid reasoning payloads", () => {
    assert.equal(mapReasoning(null), null);
    assert.equal(mapReasoning({ id: "x", summary: "y" }), null);
  });

  it("groups reasonings by category", () => {
    const collection = buildReasoningCollection([
      {
        id: "1",
        category: "workspace",
        confidence: 0.9,
        source: "clinical_decisions",
        summary: "a",
        decisionIds: ["d1"],
        references: [],
        governance: { ...GOVERNED_CLINICAL_REASONING_GOVERNANCE },
      },
      {
        id: "2",
        category: "timeline",
        confidence: 0.5,
        source: "clinical_decisions",
        summary: "b",
        decisionIds: ["d2"],
        references: [],
        governance: { ...GOVERNED_CLINICAL_REASONING_GOVERNANCE },
      },
    ]);
    assert.equal(collection.count, 2);
    assert.equal(collection.byCategory.workspace?.length, 1);
    assert.equal(collection.byCategory.timeline?.length, 1);
  });
});

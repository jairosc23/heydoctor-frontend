import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_QUALITY_ENGINE_GOVERNANCE, type ReasoningQualityEngine } from "./reasoning-quality-engine";
import { mapReasoningQualityEngine, mapReasoningQualityEngineEnvelope } from "./reasoning-quality-engine-mapper";
describe("AI-83 ReasoningQualityEngine mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReasoningQualityEngine = {
      reasoningQualityEngineId: "id1", providerId: "openai", qualitySlots: [], governance: { ...REASONING_QUALITY_ENGINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        evidenceRankingWorkspaceId: "x",
        completenessId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapReasoningQualityEngineEnvelope({ reasoningQualityEngine: { source: "reasoning_quality_engine", builderVersion: "1.0.0", reasoningQualityEngine: model, governance: { ...REASONING_QUALITY_ENGINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReasoningQualityEngine(null), null);
  });
});

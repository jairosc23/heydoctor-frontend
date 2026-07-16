import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVIDENCE_REASONING_ENGINE_GOVERNANCE, type EvidenceReasoningEngine } from "./evidence-reasoning-engine";
import { mapEvidenceReasoningEngine, mapEvidenceReasoningEngineEnvelope } from "./evidence-reasoning-engine-mapper";
describe("AI-78 EvidenceReasoningEngine mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: EvidenceReasoningEngine = {
      evidenceReasoningEngineId: "id1", providerId: "openai", evidenceReasoningSlots: [], governance: { ...EVIDENCE_REASONING_ENGINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        differentialReasoningEngineId: "x",
        evidenceGraphWorkspaceId: "x",
        confidenceId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapEvidenceReasoningEngineEnvelope({ evidenceReasoningEngine: { source: "evidence_reasoning_engine", builderVersion: "1.0.0", evidenceReasoningEngine: model, governance: { ...EVIDENCE_REASONING_ENGINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapEvidenceReasoningEngine(null), null);
  });
});

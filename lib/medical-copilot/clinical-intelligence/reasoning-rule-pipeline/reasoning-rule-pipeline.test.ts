import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_RULE_PIPELINE_GOVERNANCE, type ReasoningRulePipeline } from "./reasoning-rule-pipeline";
import { mapReasoningRulePipeline, mapReasoningRulePipelineEnvelope } from "./reasoning-rule-pipeline-mapper";
describe("AI-62 ReasoningRulePipeline mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ReasoningRulePipeline = {
      reasoningRulePipelineId: "id1", providerId: "openai", pipelineSlots: [], governance: { ...REASONING_RULE_PIPELINE_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningEngineCoreId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapReasoningRulePipelineEnvelope({ reasoningRulePipeline: { source: "reasoning_rule_pipeline", builderVersion: "1.0.0", reasoningRulePipeline: model, governance: { ...REASONING_RULE_PIPELINE_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapReasoningRulePipeline(null), null);
  });
});

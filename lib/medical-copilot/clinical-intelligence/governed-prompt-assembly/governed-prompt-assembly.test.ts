import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROMPT_ASSEMBLY_GOVERNANCE, type GovernedAssembledPrompt } from "./governed-prompt-assembly";
import { mapGovernedAssembledPrompt, mapGovernedAssembledPromptEnvelope } from "./governed-prompt-assembly-mapper";

describe("AI-16 GovernedAssembledPrompt mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedAssembledPrompt = {
      assemblyId: "id1",
      providerId: "openai",
      assemblySlots: [],
      governance: { ...PROMPT_ASSEMBLY_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedAssembledPromptEnvelope({
      assembledPrompt: {
        source: "governed_prompt_assembly",
        builderVersion: "1.0.0",
        assembledPrompt: model,
        governance: { ...PROMPT_ASSEMBLY_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedAssembledPrompt(null), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PROMPT_GOVERNANCE,
  type GovernedAIPrompt,
} from "./governed-ai-prompt";
import {
  mapGovernedAIPrompt,
  mapGovernedAIPromptEnvelope,
} from "./governed-ai-prompt-mapper";

describe("AI-7 Governed AI Prompt mapper", () => {
  it("maps prompt envelope and preserves HITL governance", () => {
    const prompt: GovernedAIPrompt = {
      promptId: "gap_gacr_gae_s1_noop_empty_noop_empty",
      providerId: "noop",
      promptSlots: [],
      governance: { ...PROMPT_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        planId: "plan-1",
        executionId: "gae_s1_empty",
        responseId: "gacr_gae_s1_noop_empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedAIPromptEnvelope({
      prompt: {
        source: "governed_ai_prompt",
        builderVersion: "1.0.0",
        prompt,
        governance: { ...PROMPT_GOVERNANCE },
        reason: "prompt_empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.prompt.providerId, "noop");
    assert.equal(mapped.prompt.metadata.status, "empty");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.prompt).sort().join(","),
      ["governance", "metadata", "promptId", "promptSlots", "providerId"]
        .sort()
        .join(","),
    );
  });

  it("rejects invalid prompt payloads", () => {
    assert.equal(mapGovernedAIPrompt(null), null);
    assert.equal(mapGovernedAIPrompt({ providerId: "openai" }), null);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PROMPT_COMPOSER_GOVERNANCE,
  type GovernedPrompt,
} from "./governed-prompt-composer";
import {
  mapGovernedPrompt,
  mapGovernedPromptEnvelope,
} from "./governed-prompt-composer-mapper";

describe("AI-9 GovernedPrompt mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedPrompt = {
      composedPromptId: "id_empty",
      providerId: "noop",
      compositionSlots: [],
      governance: { ...PROMPT_COMPOSER_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedPromptEnvelope({
      composedPrompt: {
        source: "governed_prompt_composer",
        builderVersion: "1.0.0",
        composedPrompt: model,
        governance: { ...PROMPT_COMPOSER_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.composedPrompt.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.composedPrompt).sort().join(","),
      ["composedPromptId", "governance", "metadata", "providerId", "compositionSlots"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedPrompt(null), null);
    assert.equal(mapGovernedPrompt({ providerId: "openai" }), null);
  });
});

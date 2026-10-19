import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PROMPT_TEMPLATE_GOVERNANCE,
  type GovernedPromptTemplate,
} from "./governed-prompt-template";
import {
  mapGovernedPromptTemplate,
  mapGovernedPromptTemplateEnvelope,
} from "./governed-prompt-template-mapper";

describe("AI-8 Governed Prompt Template mapper", () => {
  it("maps template envelope and preserves HITL governance", () => {
    const template: GovernedPromptTemplate = {
      templateId: "gpt_gap_gacr_gae_s1_noop_empty_noop_empty",
      providerId: "noop",
      templateSlots: [],
      governance: { ...PROMPT_TEMPLATE_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        planId: "plan-1",
        executionId: "gae_s1_empty",
        responseId: "gacr_gae_s1_noop_empty",
        promptId: "gap_gacr_gae_s1_noop_empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedPromptTemplateEnvelope({
      template: {
        source: "governed_prompt_template",
        builderVersion: "1.0.0",
        template,
        governance: { ...PROMPT_TEMPLATE_GOVERNANCE },
        reason: "prompt_template_empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.template.providerId, "noop");
    assert.equal(mapped.template.metadata.status, "empty");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.template).sort().join(","),
      ["governance", "metadata", "providerId", "templateId", "templateSlots"]
        .sort()
        .join(","),
    );
  });

  it("rejects invalid template payloads", () => {
    assert.equal(mapGovernedPromptTemplate(null), null);
    assert.equal(mapGovernedPromptTemplate({ providerId: "openai" }), null);
  });
});

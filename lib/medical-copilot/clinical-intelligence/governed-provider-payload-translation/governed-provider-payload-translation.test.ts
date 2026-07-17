import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE, type GovernedTranslatedProviderPayload } from "./governed-provider-payload-translation";
import { mapGovernedTranslatedProviderPayload, mapGovernedTranslatedProviderPayloadEnvelope } from "./governed-provider-payload-translation-mapper";

describe("AI-17 GovernedTranslatedProviderPayload mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedTranslatedProviderPayload = {
      translationId: "id1",
      providerId: "openai",
      translationSlots: [],
      governance: { ...PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE },
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
        assemblyId: "x",
        targetProvider: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedTranslatedProviderPayloadEnvelope({
      translation: {
        source: "governed_provider_payload_translation",
        builderVersion: "1.0.0",
        translation: model,
        governance: { ...PROVIDER_PAYLOAD_TRANSLATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedTranslatedProviderPayload(null), null);
  });
});

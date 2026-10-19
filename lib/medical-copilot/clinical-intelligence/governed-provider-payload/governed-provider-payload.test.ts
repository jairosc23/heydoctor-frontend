import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  PROVIDER_PAYLOAD_GOVERNANCE,
  type GovernedProviderPayload,
} from "./governed-provider-payload";
import {
  mapGovernedProviderPayload,
  mapGovernedProviderPayloadEnvelope,
} from "./governed-provider-payload-mapper";

describe("AI-10 GovernedProviderPayload mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedProviderPayload = {
      payloadId: "id_empty",
      providerId: "noop",
      payloadSlots: [],
      governance: { ...PROVIDER_PAYLOAD_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedProviderPayloadEnvelope({
      payload: {
        source: "governed_provider_payload",
        builderVersion: "1.0.0",
        payload: model,
        governance: { ...PROVIDER_PAYLOAD_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.payload.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.payload).sort().join(","),
      ["payloadId", "governance", "metadata", "providerId", "payloadSlots"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedProviderPayload(null), null);
    assert.equal(mapGovernedProviderPayload({ providerId: "openai" }), null);
  });
});

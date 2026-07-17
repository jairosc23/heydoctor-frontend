import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AI_PROVIDER_GOVERNANCE,
  type AIProviderResponse,
} from "./ai-provider";
import {
  mapAIProviderResponse,
  mapAIProviderRouteEnvelope,
} from "./ai-provider-mapper";

describe("AI-2 AI Provider mapper", () => {
  it("maps router envelope and preserves HITL governance", () => {
    const response: AIProviderResponse = {
      providerId: "noop",
      accepted: true,
      capabilities: {
        supportsChat: false,
        supportsStreaming: false,
        supportsTools: false,
        supportsEmbeddings: false,
        supportsCompletions: false,
      },
      governance: { ...AI_PROVIDER_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        planId: "plan-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        routerVersion: "1.0.0",
        status: "ok",
        selectedProviderId: "noop",
      },
    };

    const mapped = mapAIProviderRouteEnvelope({
      route: {
        source: "ai_provider_router",
        routerVersion: "1.0.0",
        response,
        governance: { ...AI_PROVIDER_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.response.providerId, "noop");
    assert.equal(mapped.response.accepted, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid response payloads", () => {
    assert.equal(mapAIProviderResponse(null), null);
    assert.equal(mapAIProviderResponse({ providerId: "openai" }), null);
  });
});

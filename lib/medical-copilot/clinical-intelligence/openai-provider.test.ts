import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GATEWAY_GOVERNANCE } from "./governed-ai-gateway";
import { mapOpenAIProviderEnvelope } from "./openai-provider-mapper";

describe("AI-4 OpenAI provider mapper", () => {
  it("maps openai gateway diagnostic envelope with HITL governance", () => {
    const mapped = mapOpenAIProviderEnvelope({
      gateway: {
        source: "governed_ai_gateway",
        gatewayVersion: "1.0.0",
        response: {
          providerId: "openai",
          accepted: false,
          governance: { ...GATEWAY_GOVERNANCE },
          metadata: {
            sessionId: "s1",
            consultationId: "c1",
            patientId: "p1",
            planId: "plan-1",
            generatedAt: "2026-07-12T00:00:00.000Z",
            gatewayVersion: "1.0.0",
            status: "rejected",
            selectedProviderId: "openai",
          },
        },
        governance: { ...GATEWAY_GOVERNANCE },
        reason: "gateway_rejected",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.response.providerId, "openai");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });
});

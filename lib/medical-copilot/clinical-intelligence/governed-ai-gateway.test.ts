import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GATEWAY_GOVERNANCE,
  type GatewayResponse,
} from "./governed-ai-gateway";
import {
  mapGatewayResponse,
  mapGovernedAIGatewayEnvelope,
} from "./governed-ai-gateway-mapper";

describe("AI-3 Governed AI Gateway mapper", () => {
  it("maps gateway envelope and preserves HITL governance", () => {
    const response: GatewayResponse = {
      providerId: "noop",
      accepted: true,
      governance: { ...GATEWAY_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        planId: "plan-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        gatewayVersion: "1.0.0",
        status: "ok",
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedAIGatewayEnvelope({
      gateway: {
        source: "governed_ai_gateway",
        gatewayVersion: "1.0.0",
        response,
        governance: { ...GATEWAY_GOVERNANCE },
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
    assert.equal(
      Object.keys(mapped.response).sort().join(","),
      ["accepted", "governance", "metadata", "providerId"].sort().join(","),
    );
  });

  it("rejects invalid response payloads", () => {
    assert.equal(mapGatewayResponse(null), null);
    assert.equal(mapGatewayResponse({ providerId: "openai" }), null);
  });
});

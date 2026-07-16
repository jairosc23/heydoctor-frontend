import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_RESPONSE_GOVERNANCE,
  type GovernedAIClinicalResponse,
} from "./governed-ai-clinical-response";
import {
  mapGovernedAIClinicalResponse,
  mapGovernedAIClinicalResponseEnvelope,
} from "./governed-ai-clinical-response-mapper";

describe("AI-6 Governed AI Clinical Response mapper", () => {
  it("maps clinical response envelope and preserves HITL governance", () => {
    const response: GovernedAIClinicalResponse = {
      responseId: "gacr_gae_s1_noop_empty",
      providerId: "noop",
      responseItems: [],
      governance: { ...CLINICAL_RESPONSE_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        planId: "plan-1",
        executionId: "gae_s1_c1_p1_plan-1_noop_empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        itemCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedAIClinicalResponseEnvelope({
      clinicalResponse: {
        source: "governed_ai_clinical_response",
        builderVersion: "1.0.0",
        response,
        governance: { ...CLINICAL_RESPONSE_GOVERNANCE },
        reason: "clinical_response_empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.response.providerId, "noop");
    assert.equal(mapped.response.metadata.status, "empty");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.response).sort().join(","),
      [
        "governance",
        "metadata",
        "providerId",
        "responseId",
        "responseItems",
      ]
        .sort()
        .join(","),
    );
  });

  it("rejects invalid response payloads", () => {
    assert.equal(mapGovernedAIClinicalResponse(null), null);
    assert.equal(
      mapGovernedAIClinicalResponse({ providerId: "openai" }),
      null,
    );
  });
});

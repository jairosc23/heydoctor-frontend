import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GOVERNED_AI_REQUEST_GOVERNANCE,
  type GovernedAIRequest,
} from "./governed-ai-request";
import {
  mapGovernedAIRequest,
  mapGovernedAIRequestEnvelope,
} from "./governed-ai-request-mapper";

describe("AI-1 Governed AI Request mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const request: GovernedAIRequest = {
      planId: "plan-1",
      requestItems: [
        {
          id: "gai-1",
          sourcePlanItemId: "plan-item-1",
          kind: "to_review",
          order: 1,
          layer: "findings",
          summary: "Finding one",
        },
      ],
      governance: { ...GOVERNED_AI_REQUEST_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        snapshotId: "snap-1",
        reviewId: "rev-1",
        contextId: "case-rep-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "partial",
        itemCount: 1,
      },
    };

    const mapped = mapGovernedAIRequestEnvelope({
      request: {
        source: "governed_ai_request_builder",
        builderVersion: "1.0.0",
        request,
        governance: { ...GOVERNED_AI_REQUEST_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.request.planId, "plan-1");
    assert.equal(mapped.request.requestItems.length, 1);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid request payloads", () => {
    assert.equal(mapGovernedAIRequest(null), null);
    assert.equal(mapGovernedAIRequest({ planId: "x" }), null);
  });
});

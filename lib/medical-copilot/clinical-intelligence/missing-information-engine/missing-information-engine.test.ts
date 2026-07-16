import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MISSING_INFORMATION_GOVERNANCE, type MissingInformationEngineResult } from "./missing-information-engine";
import { mapMissingInformationEngineResult, mapMissingInformationEngineResultEnvelope } from "./missing-information-engine-mapper";

describe("AI-24 MissingInformationEngineResult mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: MissingInformationEngineResult = {
      missingInformationId: "id1",
      providerId: "openai",
      missingSlots: [],
      governance: { ...MISSING_INFORMATION_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        differentialId: "x",
        confidenceId: "x",
        evidenceMappingId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapMissingInformationEngineResultEnvelope({
      missingInformation: {
        source: "missing_information_engine",
        builderVersion: "1.0.0",
        missingInformation: model,
        governance: { ...MISSING_INFORMATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapMissingInformationEngineResult(null), null);
  });
});

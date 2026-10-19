import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DIFFERENTIAL_FOUNDATION_GOVERNANCE, type ClinicalDifferentialFoundation } from "./clinical-differential-foundation";
import { mapClinicalDifferentialFoundation, mapClinicalDifferentialFoundationEnvelope } from "./clinical-differential-foundation-mapper";

describe("AI-21 ClinicalDifferentialFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalDifferentialFoundation = {
      differentialId: "id1",
      providerId: "openai",
      differentialSlots: [],
      governance: { ...DIFFERENTIAL_FOUNDATION_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        responseId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalDifferentialFoundationEnvelope({
      differential: {
        source: "clinical_differential_foundation",
        builderVersion: "1.0.0",
        differential: model,
        governance: { ...DIFFERENTIAL_FOUNDATION_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalDifferentialFoundation(null), null);
  });
});

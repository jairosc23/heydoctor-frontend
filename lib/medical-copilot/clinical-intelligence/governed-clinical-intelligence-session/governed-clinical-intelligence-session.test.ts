import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_INTELLIGENCE_SESSION_GOVERNANCE, type GovernedClinicalIntelligenceSession } from "./governed-clinical-intelligence-session";
import { mapGovernedClinicalIntelligenceSession, mapGovernedClinicalIntelligenceSessionEnvelope } from "./governed-clinical-intelligence-session-mapper";
describe("AI-93 GovernedClinicalIntelligenceSession mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalIntelligenceSession = {
      governedClinicalIntelligenceSessionId: "id1", providerId: "openai", sessionSlots: [], governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_SESSION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceValidationId: "x",
        reviewSessionId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedClinicalIntelligenceSessionEnvelope({ governedClinicalIntelligenceSession: { source: "governed_clinical_intelligence_session", builderVersion: "1.0.0", governedClinicalIntelligenceSession: model, governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_SESSION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalIntelligenceSession(null), null);
  });
});

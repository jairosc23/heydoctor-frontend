import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE, type GovernedClinicalReasoningSession } from "./governed-clinical-reasoning-session";
import { mapGovernedClinicalReasoningSession, mapGovernedClinicalReasoningSessionEnvelope } from "./governed-clinical-reasoning-session-mapper";
describe("AI-74 GovernedClinicalReasoningSession mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalReasoningSession = {
      governedClinicalReasoningSessionId: "id1", providerId: "openai", sessionSlots: [], governance: { ...GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalReasoningTraceId: "x",
        governedReasoningSessionId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedClinicalReasoningSessionEnvelope({ governedClinicalReasoningSession: { source: "governed_clinical_reasoning_session", builderVersion: "1.0.0", governedClinicalReasoningSession: model, governance: { ...GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalReasoningSession(null), null);
  });
});

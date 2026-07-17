import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_INTELLIGENCE_FLOW_GOVERNANCE } from "./governed-clinical-intelligence-flow";
import {
  mapGovernedClinicalIntelligenceFlow,
  mapGovernedClinicalIntelligenceFlowEnvelope,
} from "./governed-clinical-intelligence-flow-mapper";

describe("Phase 2 GovernedClinicalIntelligenceFlow mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const flow = {
      source: "governed_clinical_intelligence_flow" as const,
      flowVersion: "1.0.0" as const,
      status: "draft_ready" as const,
      sessionId: "s1",
      consultationId: "c1",
      patientId: "p1",
      governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_FLOW_GOVERNANCE },
      packageRefs: {
        foundationId: "gcif-1",
        clinicalReasoningPackageId: "crpkg-1",
        contextId: null,
        clinicalPlanId: null,
        reviewId: null,
        providerExecutionId: null,
        normalizedResponseId: null,
        clinicalAiOutputId: null,
        processedResponseId: null,
      },
      draft: {
        status: "draft_ready",
        assistiveOnlyNotice: "Solo asistencia — revisión médica obligatoria",
        possibleDiagnoses: ["hipótesis A"],
        recommendations: ["preguntar X"],
        generalEducation: [],
        summary: null,
        suggestedDiagnosis: [],
        improvedNotes: null,
        citations: [],
        model: "gpt-4o-mini",
        provider: "openai",
        aiRunId: "run-1",
        safetyVerdict: "ALLOW",
        blockReason: null,
        llmInvocationStatus: "invoked",
      },
      reason: "governed_clinical_intelligence_draft_ready_for_physician_review",
      generatedAt: "2026-07-13T00:00:00.000Z",
    };

    const mapped = mapGovernedClinicalIntelligenceFlowEnvelope({ flow });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.status, "draft_ready");
    assert.equal(mapped.draft?.possibleDiagnoses[0], "hipótesis A");
    assert.equal(mapGovernedClinicalIntelligenceFlow(null), null);
  });
});

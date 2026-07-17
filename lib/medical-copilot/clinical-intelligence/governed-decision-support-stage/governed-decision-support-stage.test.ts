import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapGovernedDecisionSupportStageEnvelope } from "./governed-decision-support-stage-mapper";
describe("GovernedDecisionSupportStage mapper", () => {
  it("maps pipeline stage without write/LLM flags", () => {
    const mapped = mapGovernedDecisionSupportStageEnvelope({
      status: "READY_FOR_PHYSICIAN_REVIEW",
      title: "Governed Decision Support Stage",
      kind: "clinical_intake",
      order: 1,
      summary: "Integrated intake",
      sourcePackages: ["medical_copilot_session"],
      surfaceRefs: [{ sourcePackage: "medical_copilot_session", surfaceKind: "session_identity", metricLabel: "sessionBound", metricValue: 1 }],
      governance: { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false, draftApproved: false, writesEmr: false, repositoryInvoked: false, automaticDecision: false, usesLlm: false, generatesNewClinicalContent: false },
      reason: "ok",
    });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.usesLlm, false);
    assert.equal(mapped.generatesNewClinicalContent, false);
    assert.equal(mapped.stages.length, 1);
    assert.equal(mapGovernedDecisionSupportStageEnvelope(null), null);
  });
});

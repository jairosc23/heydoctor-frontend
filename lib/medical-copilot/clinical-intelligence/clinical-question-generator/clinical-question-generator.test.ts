import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_QUESTION_GENERATOR_GOVERNANCE, type ClinicalQuestionGeneratorResult } from "./clinical-question-generator";
import { mapClinicalQuestionGeneratorResult, mapClinicalQuestionGeneratorResultEnvelope } from "./clinical-question-generator-mapper";

describe("AI-41 ClinicalQuestionGeneratorResult mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalQuestionGeneratorResult = {
      clinicalQuestionsId: "id1",
      providerId: "openai",
      questionSlots: [],
      governance: { ...CLINICAL_QUESTION_GENERATOR_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        reviewSessionId: "x",
        contextId: "x",
        missingInformationId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalQuestionGeneratorResultEnvelope({
      clinicalQuestions: {
        source: "clinical_question_generator",
        builderVersion: "1.0.0",
        clinicalQuestions: model,
        governance: { ...CLINICAL_QUESTION_GENERATOR_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalQuestionGeneratorResult(null), null);
  });
});

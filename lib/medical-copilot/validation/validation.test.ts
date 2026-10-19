import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_VALIDATION_VERSION,
  VALIDATION_QUESTIONNAIRE_VERSION,
  createClinicalValidationService,
  computeNetSatisfactionScore,
  computeValidationMetrics,
  exportValidationMetrics,
  scrubValidationComment,
  DEFAULT_VALIDATION_QUESTIONNAIRE,
} from "./index";

describe("Clinical Validation PHI scrubbing", () => {
  it("redacta email, teléfono y fugas clínicas en comentarios", () => {
    const scrubbed = scrubValidationComment(
      "Mi email es doc@clinic.com y el paciente tenía cefalea",
      200,
    );
    assert.ok(scrubbed);
    assert.ok(!scrubbed!.includes("doc@clinic.com"));
    assert.ok(!/\bpaciente\b/i.test(scrubbed!));
    assert.ok(!/\bcefalea\b/i.test(scrubbed!));
    assert.ok(scrubbed!.includes("[REDACTED]"));
  });
});

describe("ClinicalValidationService", () => {
  it("abre sesión anónima versionada, responde Likert y exporta métricas", () => {
    const service = createClinicalValidationService();
    const session = service.openSession({ cohortTag: "clinical_beta" });

    assert.equal(session.status, "open");
    assert.equal(session.version, CLINICAL_VALIDATION_VERSION);
    assert.equal(session.questionnaireVersion, VALIDATION_QUESTIONNAIRE_VERSION);
    assert.equal(session.cohortTag, "clinical_beta");
    assert.equal(
      (session as { consultationRef?: string }).consultationRef,
      undefined,
    );
    assert.equal((session as { patientId?: string }).patientId, undefined);

    service.updateLikert("perceived_utility", 4);
    service.updateLikert("suggestion_clarity", 5);
    service.updateLikert("dictation_ease", 3);
    service.updateLikert("copilot_trust", 4);
    service.updateLikert("overall_satisfaction", 5);
    service.updateLikert("perceived_response_time", 4);
    service.updateLikert("willingness_to_reuse", 5);
    service.setIncidentCategory("performance");
    service.setOptionalComment("La UI fue clara pero lenta");

    const submitted = service.submit();
    assert.equal(submitted.status, "submitted");
    assert.equal(submitted.answers.willingness_to_reuse, 5);
    assert.equal(submitted.answers.perceived_response_time, 4);

    const metrics = service.getMetrics();
    assert.equal(metrics.evaluatedSessions, 1);
    assert.equal(metrics.sessionsSubmitted, 1);
    assert.equal(metrics.questionnaireCompletionRate, 1);
    assert.equal(metrics.averageScores.overall_satisfaction, 5);
    assert.equal(metrics.trustDistribution[4], 1);
    assert.equal(metrics.incidentCounts.performance, 1);
    assert.ok(metrics.netSatisfactionScore !== null);
    assert.equal(metrics.netSatisfactionScore, 100);

    const exported = service.exportMetrics();
    assert.equal(exported.foundationVersion, CLINICAL_VALIDATION_VERSION);
    assert.equal(
      exported.metrics.questionnaireVersion,
      VALIDATION_QUESTIONNAIRE_VERSION,
    );
    assert.ok(exported.exportedAt);
    assert.equal(
      (exported.metrics as { consultationId?: string }).consultationId,
      undefined,
    );
    assert.deepEqual(
      exportValidationMetrics(metrics, exported.exportedAt).metrics
        .evaluatedSessions,
      1,
    );

    const events = service.getEvents();
    assert.ok(events.some((e) => e.type === "validation_opened"));
    assert.ok(events.every((e) => e.questionnaireVersion === "v1.1.0"));
  });

  it("permite omitir el cuestionario voluntariamente", () => {
    const service = createClinicalValidationService();
    service.openSession();
    const dismissed = service.dismiss();
    assert.equal(dismissed.status, "dismissed");
    const metrics = service.getMetrics();
    assert.equal(metrics.sessionsDismissed, 1);
    assert.equal(metrics.evaluatedSessions, 0);
  });

  it("expone cuestionario v1.1.0 con 7 preguntas UX", () => {
    assert.equal(DEFAULT_VALIDATION_QUESTIONNAIRE.questionnaireVersion, "v1.1.0");
    assert.equal(DEFAULT_VALIDATION_QUESTIONNAIRE.questions.length, 7);
    assert.ok(
      DEFAULT_VALIDATION_QUESTIONNAIRE.questions.some(
        (q) => q.id === "willingness_to_reuse",
      ),
    );
    assert.ok(
      DEFAULT_VALIDATION_QUESTIONNAIRE.questions.some(
        (q) => q.id === "perceived_response_time",
      ),
    );
  });

  it("computeNetSatisfactionScore y métricas agregadas sin PHI", () => {
    assert.equal(computeNetSatisfactionScore([5, 4, 1]), 33.33);
    assert.equal(computeNetSatisfactionScore([]), null);

    const empty = computeValidationMetrics([]);
    assert.equal(empty.evaluatedSessions, 0);
    assert.equal(empty.questionnaireCompletionRate, 0);
    assert.equal(empty.netSatisfactionScore, null);
  });
});

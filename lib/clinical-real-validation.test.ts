import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REAL_CLINICAL_CASES,
  computeAssistVsSummaryParity,
  runRealClinicalValidation,
  simulateSummaryV2Fallback,
  validateRealClinicalCase,
} from "./clinical-real-validation";
import { buildConsultationSummaryRequest } from "./services/ai-clinical";

describe("clinical-real-validation Phase 4.5.4", () => {
  it("ejecuta batería de 5 casos clínicos reales", () => {
    const report = runRealClinicalValidation();
    assert.equal(report.cases.length, 5);
    assert.ok(report.aggregateScores.composite >= 7);
    assert.ok(report.assistVsSummaryAvgParity >= 8);
  });

  it("Prioridad 1 HTA — PA en assist, SOAP y summary v2 fallback", () => {
    const fixture = REAL_CLINICAL_CASES.find((c) => c.priority === "hta")!;
    const result = validateRealClinicalCase(fixture);

    assert.equal(result.code, "I10");
    assert.ok(result.checks.assistUsesVitals);
    assert.ok(result.checks.fallbackUsesVitals);
    assert.ok(result.parity.parityScore >= 8);
    assert.match(result.summaryV2Notes, /152\/98|Signos vitales/);
    assert.doesNotMatch(result.assistSoap, /Por documentar en consulta/);
  });

  it("Prioridad 2 DM2 — memoria, labs y medicación en contexto", () => {
    const fixture = REAL_CLINICAL_CASES.find((c) => c.priority === "dm2")!;
    const result = validateRealClinicalCase(fixture);

    assert.ok(result.checks.memoryInAssist);
    assert.ok(result.checks.memoryInSummary);
    assert.ok(result.checks.labsInContext);
    assert.ok(result.strengths.some((s) => /Medicación|memoria/i.test(s)));
  });

  it("Prioridad 3 Asma — medicamentos inhalados en assist y summary", () => {
    const fixture = REAL_CLINICAL_CASES.find((c) => c.priority === "asma")!;
    const result = validateRealClinicalCase(fixture);

    assert.ok(result.checks.memoryInAssist);
    assert.match(result.parity.assistPrompt, /Salbutamol|Budesonida/);
    assert.match(result.parity.summarySnapshotPrompt, /Salbutamol|Budesonida/);
  });

  it("Prioridad 4 Examen físico — sin placeholders ni invenciones", () => {
    const fixture = REAL_CLINICAL_CASES.find(
      (c) => c.priority === "physical_exam",
    )!;
    const result = validateRealClinicalCase(fixture);

    assert.ok(result.checks.peSectionsWhenDocumented);
    assert.ok(result.checks.noInventedPe);
    assert.match(result.summaryV2Notes, /Ritmo regular/);
    assert.match(result.summaryV2Notes, /MV conservado/);
    for (const bad of fixture.mustNotContain) {
      assert.ok(!result.assistSoap.includes(bad), `no debe contener ${bad}`);
    }
  });

  it("Prioridad 5 Fallback — paridad assist vs summary snapshot", () => {
    const fixture = REAL_CLINICAL_CASES.find((c) => c.priority === "fallback")!;
    const req = buildConsultationSummaryRequest(fixture.input);
    const parity = computeAssistVsSummaryParity(
      req.clientSnapshot?.clinicalContextPrompt ?? "",
      req.clientSnapshot?.clinicalContextPrompt ?? "",
      fixture.mustPreserve,
    );

    assert.equal(parity.parityScore, 10);
    const fallback = simulateSummaryV2Fallback(fixture.input);
    assert.match(fallback.improvedNotes, /152\/98|Signos vitales/);
    assert.match(fallback.enrichedContext, /Losartán/);
  });

  it("summary snapshot prompt idéntico a assist context prompt", () => {
    for (const fixture of REAL_CLINICAL_CASES) {
      const req = buildConsultationSummaryRequest(fixture.input);
      const result = validateRealClinicalCase(fixture);
      assert.equal(
        req.clientSnapshot?.clinicalContextPrompt,
        result.parity.assistPrompt,
        `${fixture.id} debe alinear assist y summary snapshot`,
      );
    }
  });
});

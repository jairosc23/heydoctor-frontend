import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DOCUMENTATION_QUALITY_CLINICAL_EXPECTATIONS,
  runDocumentationQualityCalibrationComparison,
  runDocumentationQualityClinicalAudit,
} from "./clinical-documentation-quality-audit";

describe("clinical-documentation-quality-audit Phase 4.7D", () => {
  it("audita 20 escenarios con expectativa clínica", () => {
    const report = runDocumentationQualityClinicalAudit();
    assert.equal(report.scenarioCount, 20);
    assert.equal(
      DOCUMENTATION_QUALITY_CLINICAL_EXPECTATIONS.length,
      20,
    );
    assert.ok(report.aggregate.avgScore >= 55);
  });

  it("reduce falsos Excelente vs baseline 4.7C", () => {
    const cmp = runDocumentationQualityCalibrationComparison();
    assert.ok(cmp.goalMet.falseExcelenteReduced);
    assert.ok(cmp.delta.falseExcelente < 0);
  });

  it("mejora alineación clínica vs baseline 4.7C", () => {
    const cmp = runDocumentationQualityCalibrationComparison();
    assert.ok(cmp.goalMet.alignmentImproved);
    assert.ok(cmp.after.clinicalAlignmentPct >= 75);
  });

  it("HTA sin examen CV — no Excelente", () => {
    const report = runDocumentationQualityClinicalAudit();
    const hta = report.scenarios.find((s) => s.scenarioId === "audit-hta-control")!;
    assert.equal(hta.systemLabel, "Adecuado");
    assert.notEqual(hta.systemLabel, "Excelente");
  });

  it("EPOC exacerbación — no Excelente por PE incompleto", () => {
    const report = runDocumentationQualityClinicalAudit();
    const epoc = report.scenarios.find((s) => s.scenarioId === "audit-epoc")!;
    assert.equal(epoc.systemLabel, "Adecuado");
  });

  it("preventivo completo — Excelente", () => {
    const report = runDocumentationQualityClinicalAudit();
    const prev = report.scenarios.find((s) => s.scenarioId === "audit-preventivo")!;
    assert.equal(prev.systemLabel, "Excelente");
    assert.ok(prev.score >= 85);
  });

  it("cefalea breve — Adecuado sin penalizar por longitud", () => {
    const report = runDocumentationQualityClinicalAudit();
    const cef = report.scenarios.find((s) => s.scenarioId === "audit-cefalea")!;
    assert.equal(cef.systemLabel, "Adecuado");
    assert.ok(cef.score >= 60);
  });

  it("IRA aguda — Adecuado no Excelente", () => {
    const report = runDocumentationQualityClinicalAudit();
    const ir = report.scenarios.find((s) => s.scenarioId === "audit-ir-aguda")!;
    assert.equal(ir.systemLabel, "Adecuado");
    assert.ok(ir.score >= 75);
  });

  it("comparativa 4.7C vs 4.7D cumple objetivos de calibración", () => {
    const cmp = runDocumentationQualityCalibrationComparison();
    assert.equal(cmp.after.falseExcelente, 0);
    assert.ok(cmp.after.clinicalAlignmentPct >= 90);
    assert.ok(cmp.goalMet.noQuantityBiasRegression);
  });

  it("pesos priorizan vitales y examen sobre anamnesis por longitud", () => {
    const report = runDocumentationQualityClinicalAudit();
    assert.equal(report.weights.anamnesis, 10);
    assert.equal(report.weights.vitals, 18);
    assert.equal(report.weights.peFull, 18);
    assert.equal(report.weights.anamnesis < report.weights.vitals, true);
  });
});

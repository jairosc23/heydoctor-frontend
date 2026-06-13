import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COPILOT_AUDIT_SCENARIOS,
  formatCopilotAuditScenarioRow,
  runCopilotClinicalAudit,
  runCopilotNoiseReductionComparison,
  runCopilotCoverageComparison,
} from "./clinical-copilot-audit";

describe("clinical-copilot-audit Phase 4.7", () => {
  it("ejecuta batería de 20 escenarios clínicos representativos", () => {
    const report = runCopilotClinicalAudit();
    assert.equal(report.scenarioCount, 20);
    assert.equal(report.cases.length, 20);
    assert.ok(report.aggregate.avgQualityScore >= 50);
    assert.ok(report.findings.length > 0);
  });

  it("cubre categorías clínicas obligatorias Phase 4.7", () => {
    const categories = new Set(COPILOT_AUDIT_SCENARIOS.map((s) => s.category));
    const required = [
      "hta",
      "dm2",
      "asma",
      "epoc",
      "hipotiroidismo",
      "obesidad",
      "cefalea",
      "lumbalgia",
      "erge",
      "infeccion_respiratoria",
      "parkinson",
      "fibrilacion_auricular",
      "artrosis",
      "ansiedad",
      "depresion",
      "nino_sano",
      "control_preventivo",
      "polimedicado",
      "sin_controles",
      "multiples_diagnosticos",
    ] as const;
    for (const cat of required) {
      assert.ok(categories.has(cat), `falta categoría ${cat}`);
    }
  });

  it("HTA — insights útiles y riesgo PA elevada", () => {
    const report = runCopilotClinicalAudit();
    const hta = report.cases.find((c) => c.id === "audit-hta-control")!;
    assert.ok(hta.bundle.insights.some((i) => i.id === "hta-vitals"));
    assert.ok(hta.bundle.riskSignals.some((s) => s.id === "risk-elevated-bp"));
    assert.ok(hta.summary.útil >= 2);
  });

  it("DM2 — labs, medicación y alertas documentados", () => {
    const report = runCopilotClinicalAudit();
    const dm2 = report.cases.find((c) => c.id === "audit-dm2-seguimiento")!;
    assert.ok(dm2.bundle.insights.some((i) => i.id === "dm2-lab"));
    assert.ok(dm2.bundle.riskSignals.some((s) => s.id === "risk-pending-labs"));
  });

  it("Phase 4.7B — risk-baseline eliminado", () => {
    const report = runCopilotClinicalAudit();
    const baselinePresent = report.cases.some((c) =>
      c.bundle.riskSignals.some((s) => s.id === "risk-baseline"),
    );
    assert.equal(baselinePresent, false);
  });

  it("Phase 4.7B — comparativa ruido reducido vs baseline 4.7", () => {
    const cmp = runCopilotNoiseReductionComparison();
    assert.ok(cmp.goalMet.baselineEliminated);
    assert.ok(cmp.goalMet.noiseReduced);
    assert.ok(cmp.delta.ruido <= 0);
  });

  it("Phase 4.7C — cobertura ampliada sin ruido ni falsos positivos", () => {
    const cmp = runCopilotCoverageComparison();
    assert.ok(cmp.goalMet.zeroNoise);
    assert.ok(cmp.goalMet.zeroFalsePositives);
    assert.ok(cmp.goalMet.coverageIncreased);
    assert.ok(cmp.delta.útil >= 0);
    assert.equal(cmp.delta.ruido, 0);
  });

  it("identifica ruido residual (no risk-baseline)", () => {
    const report = runCopilotClinicalAudit();
    const baselineNoise = report.falsePositives.filter((f) =>
      f.detail.includes("risk-baseline"),
    );
    assert.equal(baselineNoise.length, 0);
  });

  it("documenta falsos negativos residuales en consultas agudas sin memoria", () => {
    const report = runCopilotClinicalAudit();
    const acuteSilent = report.cases.filter(
      (c) =>
        c.bundle.silenceMode &&
        ["cefalea", "lumbalgia", "infeccion_respiratoria", "nino_sano"].includes(
          c.category,
        ),
    );
    assert.ok(acuteSilent.length >= 3);
  });

  it("incluye propuestas de ruido, ranking y calibración quality", () => {
    const report = runCopilotClinicalAudit();
    assert.ok(report.noiseProposals.length >= 8);
    assert.ok(report.rankingDesign.riskSignals.length >= 5);
    assert.ok(report.qualityScoreAudit.calibrationProposal.length >= 4);
    assert.ok(report.recommendations.length >= 4);
  });

  it("formatCopilotAuditScenarioRow genera fila de tabla", () => {
    const report = runCopilotClinicalAudit();
    const row = formatCopilotAuditScenarioRow(report.cases[0]!);
    assert.match(row, /^\| /);
    assert.match(row, /útil=/);
  });
});

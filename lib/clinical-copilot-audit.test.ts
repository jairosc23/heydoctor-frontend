import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COPILOT_AUDIT_SCENARIOS,
  formatCopilotAuditScenarioRow,
  runCopilotClinicalAudit,
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

  it("identifica ruido risk-baseline en escenarios sin riesgo real", () => {
    const report = runCopilotClinicalAudit();
    const baselineNoise = report.falsePositives.filter((f) =>
      f.detail.includes("risk-baseline"),
    );
    assert.ok(baselineNoise.length >= 10);
  });

  it("documenta falsos negativos por cobertura limitada I10/E11/J45", () => {
    const report = runCopilotClinicalAudit();
    const motorGaps = report.falseNegatives.filter((f) =>
      f.detail.includes("Sin reglas"),
    );
    assert.ok(motorGaps.length >= 5);
  });

  it("incluye propuestas de ruido, ranking y calibración quality", () => {
    const report = runCopilotClinicalAudit();
    assert.ok(report.noiseProposals.length >= 8);
    assert.ok(report.rankingDesign.riskSignals.length >= 5);
    assert.ok(report.qualityScoreAudit.calibrationProposal.length >= 4);
    assert.ok(report.recommendations.length >= 6);
  });

  it("formatCopilotAuditScenarioRow genera fila de tabla", () => {
    const report = runCopilotClinicalAudit();
    const row = formatCopilotAuditScenarioRow(report.cases[0]!);
    assert.match(row, /^\| /);
    assert.match(row, /útil=/);
  });
});

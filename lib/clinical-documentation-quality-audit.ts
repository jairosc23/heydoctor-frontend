/**
 * Phase 4.7D — Documentation Quality Calibration™
 * Auditoría clínica del score documental vs expectativa médica.
 */

import {
  COPILOT_AUDIT_SCENARIOS,
  type CopilotAuditScenario,
} from "./clinical-copilot-audit";
import {
  buildClinicalCopilotIntelligence,
  type DocumentationQualityLabel,
} from "./clinical-copilot-intelligence";

export type DocumentationQualityClinicalExpectation = {
  scenarioId: string;
  label: DocumentationQualityLabel;
  rationale: string;
};

/** Clasificación esperada por criterio médico (20 escenarios Phase 4.7). */
export const DOCUMENTATION_QUALITY_CLINICAL_EXPECTATIONS: DocumentationQualityClinicalExpectation[] =
  [
    {
      scenarioId: "audit-hta-control",
      label: "Adecuado",
      rationale: "PA documentada y plan con seguimiento; falta examen cardiovascular estructurado.",
    },
    {
      scenarioId: "audit-dm2-seguimiento",
      label: "Adecuado",
      rationale: "Dx, anamnesis y plan con control; sin vitales ni examen en consulta actual.",
    },
    {
      scenarioId: "audit-asma-estable",
      label: "Excelente",
      rationale: "Control crónico con SatO2, auscultación pulmonar y seguimiento.",
    },
    {
      scenarioId: "audit-epoc",
      label: "Adecuado",
      rationale: "Exacerbación con SatO2 y hallazgo aislado; examen respiratorio incompleto para Excelente.",
    },
    {
      scenarioId: "audit-hipotiroidismo",
      label: "Adecuado",
      rationale: "Seguimiento crónico con plan; sin vitales ni objetivos documentados.",
    },
    {
      scenarioId: "audit-obesidad",
      label: "Adecuado",
      rationale: "Peso/talla documentados y plan con control; score alto pero sin examen completo para Excelente.",
    },
    {
      scenarioId: "audit-cefalea",
      label: "Adecuado",
      rationale: "Consulta aguda breve con exploración neurológica; sin seguimiento explícito.",
    },
    {
      scenarioId: "audit-lumbalgia",
      label: "Adecuado",
      rationale: "Cuadro musculoesquelético con maniobra documentada y plan con reevaluación.",
    },
    {
      scenarioId: "audit-erge",
      label: "Incompleto",
      rationale: "Anamnesis y plan presentes; falta seguimiento documentado y objetivos clínicos.",
    },
    {
      scenarioId: "audit-ir-aguda",
      label: "Adecuado",
      rationale: "IRA con fiebre, orofaringe y auscultación; documentación aguda completa pero no Excelente.",
    },
    {
      scenarioId: "audit-parkinson",
      label: "Adecuado",
      rationale: "Seguimiento neurológico con evolución y plan; sin vitales.",
    },
    {
      scenarioId: "audit-fa",
      label: "Adecuado",
      rationale: "Control anticoagulación con FC; falta PA y examen cardiovascular.",
    },
    {
      scenarioId: "audit-artrosis",
      label: "Incompleto",
      rationale: "Anamnesis articular presente; plan sin seguimiento ni reevaluación documentada.",
    },
    {
      scenarioId: "audit-ansiedad",
      label: "Adecuado",
      rationale: "Evaluación psiquiátrica breve con plan y control; sin vitales.",
    },
    {
      scenarioId: "audit-depresion",
      label: "Adecuado",
      rationale: "Seguimiento con medicación y control; documentación clínica suficiente.",
    },
    {
      scenarioId: "audit-nino-sano",
      label: "Adecuado",
      rationale: "Control pediátrico breve válido; sin vitales ni examen estructurado.",
    },
    {
      scenarioId: "audit-preventivo",
      label: "Excelente",
      rationale: "Chequeo con PA, examen físico global y seguimiento anual.",
    },
    {
      scenarioId: "audit-polimedicado",
      label: "Adecuado",
      rationale: "Revisión polifarmacia con PA; falta examen CV para calidad excelente.",
    },
    {
      scenarioId: "audit-sin-controles",
      label: "Adecuado",
      rationale: "PA elevada y plan de reenganche; examen CV ausente.",
    },
    {
      scenarioId: "audit-multi-dx",
      label: "Adecuado",
      rationale: "Multimorbilidad con PA y peso; seguimiento documentado sin examen completo.",
    },
  ];

export type DocumentationQualityScenarioAudit = {
  scenarioId: string;
  category: string;
  label: string;
  score: number;
  systemLabel: DocumentationQualityLabel;
  expectedLabel: DocumentationQualityLabel;
  rationale: string;
  factors: string;
  mismatch: "falso_excelente" | "falso_adecuado" | "falso_incompleto" | null;
  aligned: boolean;
};

export type DocumentationQualityCalibrationReport = {
  methodology: string;
  scenarioCount: number;
  scenarios: DocumentationQualityScenarioAudit[];
  aggregate: {
    avgScore: number;
    labelCounts: Record<DocumentationQualityLabel, number>;
    falseExcelente: number;
    falseAdecuado: number;
    falseIncompleto: number;
    clinicalAlignmentPct: number;
  };
  weights: {
    dx: number;
    motivo: number;
    anamnesis: number;
    vitals: number;
    peFull: number;
    pePartial: number;
    plan: number;
    followup: number;
  };
  thresholds: {
    excelente: number;
    adecuado: number;
  };
};

function labelRank(label: DocumentationQualityLabel): number {
  if (label === "Excelente") return 3;
  if (label === "Adecuado") return 2;
  return 1;
}

function classifyMismatch(
  systemLabel: DocumentationQualityLabel,
  expectedLabel: DocumentationQualityLabel,
): DocumentationQualityScenarioAudit["mismatch"] {
  const delta = labelRank(systemLabel) - labelRank(expectedLabel);
  if (delta === 0) return null;
  if (delta > 0) {
    if (systemLabel === "Excelente") return "falso_excelente";
    return "falso_adecuado";
  }
  return "falso_incompleto";
}

export function auditDocumentationQualityScenario(
  scenario: CopilotAuditScenario,
  expectation: DocumentationQualityClinicalExpectation,
): DocumentationQualityScenarioAudit {
  const bundle = buildClinicalCopilotIntelligence(scenario.input);
  const q = bundle.documentationQuality;
  const systemLabel = q.label;
  const expectedLabel = expectation.label;
  const mismatch = classifyMismatch(systemLabel, expectedLabel);

  return {
    scenarioId: scenario.id,
    category: scenario.category,
    label: scenario.label,
    score: q.score,
    systemLabel,
    expectedLabel,
    rationale: expectation.rationale,
    factors: q.factors.map((f) => `${f.id}:${f.points}/${f.max}`).join(" "),
    mismatch,
    aligned: mismatch === null,
  };
}

export function runDocumentationQualityClinicalAudit(
  scenarios: CopilotAuditScenario[] = COPILOT_AUDIT_SCENARIOS,
): DocumentationQualityCalibrationReport {
  const expectationsById = new Map(
    DOCUMENTATION_QUALITY_CLINICAL_EXPECTATIONS.map((e) => [e.scenarioId, e]),
  );

  const scenariosAudit = scenarios.map((s) => {
    const exp = expectationsById.get(s.id);
    if (!exp) {
      throw new Error(`Falta expectativa clínica para escenario ${s.id}`);
    }
    return auditDocumentationQualityScenario(s, exp);
  });

  const labelCounts: Record<DocumentationQualityLabel, number> = {
    Excelente: 0,
    Adecuado: 0,
    Incompleto: 0,
  };

  let falseExcelente = 0;
  let falseAdecuado = 0;
  let falseIncompleto = 0;
  let aligned = 0;
  let scoreSum = 0;

  for (const row of scenariosAudit) {
    scoreSum += row.score;
    labelCounts[row.systemLabel] += 1;
    if (row.aligned) aligned += 1;
    if (row.mismatch === "falso_excelente") falseExcelente += 1;
    if (row.mismatch === "falso_adecuado") falseAdecuado += 1;
    if (row.mismatch === "falso_incompleto") falseIncompleto += 1;
  }

  return {
    methodology:
      "Phase 4.7D — comparación score sistema vs clasificación clínica esperada " +
      "sobre 20 escenarios COPILOT_AUDIT_SCENARIOS.",
    scenarioCount: scenariosAudit.length,
    scenarios: scenariosAudit,
    aggregate: {
      avgScore: Math.round(scoreSum / scenariosAudit.length),
      labelCounts,
      falseExcelente,
      falseAdecuado,
      falseIncompleto,
      clinicalAlignmentPct: Math.round((aligned / scenariosAudit.length) * 100),
    },
    weights: {
      dx: 20,
      motivo: 10,
      anamnesis: 10,
      vitals: 18,
      peFull: 18,
      pePartial: 10,
      plan: 14,
      followup: 10,
    },
    thresholds: {
      excelente: 85,
      adecuado: 60,
    },
  };
}

/** Métricas congeladas pre-4.7D (commit e4e2fa4a — Phase 4.7C). */
export const DOCUMENTATION_QUALITY_BASELINE_47C = {
  avgScore: 75,
  labelCounts: { Excelente: 8, Adecuado: 11, Incompleto: 1 } as Record<
    DocumentationQualityLabel,
    number
  >,
  falseExcelente: 5,
  falseAdecuado: 3,
  falseIncompleto: 0,
  clinicalAlignmentPct: 60,
  quantityBiasCases: [
    "audit-epoc",
    "audit-ir-aguda",
    "audit-preventivo",
    "audit-asma-estable",
    "audit-obesidad",
    "audit-lumbalgia",
    "audit-hta-control",
  ],
} as const;

export type DocumentationQualityCalibrationComparison = {
  before: typeof DOCUMENTATION_QUALITY_BASELINE_47C;
  after: DocumentationQualityCalibrationReport["aggregate"];
  delta: {
    avgScore: number;
    falseExcelente: number;
    falseAdecuado: number;
    falseIncompleto: number;
    clinicalAlignmentPct: number;
  };
  goalMet: {
    falseExcelenteReduced: boolean;
    alignmentImproved: boolean;
    noQuantityBiasRegression: boolean;
  };
};

export function runDocumentationQualityCalibrationComparison(): DocumentationQualityCalibrationComparison {
  const report = runDocumentationQualityClinicalAudit();
  const after = report.aggregate;
  const before = DOCUMENTATION_QUALITY_BASELINE_47C;

  return {
    before,
    after,
    delta: {
      avgScore: after.avgScore - before.avgScore,
      falseExcelente: after.falseExcelente - before.falseExcelente,
      falseAdecuado: after.falseAdecuado - before.falseAdecuado,
      falseIncompleto: after.falseIncompleto - before.falseIncompleto,
      clinicalAlignmentPct: after.clinicalAlignmentPct - before.clinicalAlignmentPct,
    },
    goalMet: {
      falseExcelenteReduced: after.falseExcelente < before.falseExcelente,
      alignmentImproved: after.clinicalAlignmentPct > before.clinicalAlignmentPct,
      noQuantityBiasRegression:
        after.falseExcelente === 0 &&
        after.falseExcelente < before.falseExcelente,
    },
  };
}

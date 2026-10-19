import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClinicalCopilotIntelligence,
  buildDocumentationQuality,
  COPILOT_RISK_EMPTY_MESSAGE,
  COPILOT_SILENCE_MESSAGE,
} from "./clinical-copilot-intelligence";
import type { PatientClinicalMemory } from "./types/clinical-memory";

function memoryBase(patientId: string): PatientClinicalMemory {
  return {
    patientId,
    activeConditions: [],
    recentDiagnoses: [],
    currentMedications: [],
    pendingLabs: [],
    alerts: [],
    recentConsultations: [],
  };
}

describe("clinical-copilot-intelligence Phase 4.6 / 4.7B", () => {
  it("HTA — insight PA elevada y risk nivel sin duplicar valores", () => {
    const notes =
      "Signos vitales: PA 152/98 mmHg, FC 78 lpm. Paciente refiere cefalea leve.";
    const bundle = buildClinicalCopilotIntelligence({
      consultationId: "c1",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión arterial esencial",
      chiefComplaint: "Control de presión",
      notes,
      treatment: "Continuar antihipertensivo. Control en 4 semanas.",
      clinicalMemoryRaw: memoryBase("p1"),
    });

    const htaInsight = bundle.insights.find((i) => i.id === "hta-vitals");
    assert.ok(htaInsight);
    assert.match(htaInsight!.body, /152\/98/);

    const bpRisk = bundle.riskSignals.find((s) => s.id === "risk-elevated-bp");
    assert.ok(bpRisk);
    assert.doesNotMatch(bpRisk!.body, /152\/98/);
    assert.match(bpRisk!.body, /moderado|Clinical Insight/);
  });

  it("DM2 — HbA1c en insight; alerta solo en risk (sin dm2-rx)", () => {
    const memory: PatientClinicalMemory = {
      ...memoryBase("p2"),
      currentMedications: [
        {
          name: "Metformina 850 mg",
          prescriptionId: "rx1",
          since: "2025-01-01",
        },
      ],
      pendingLabs: [
        {
          exam: "HbA1c 8.2%",
          labOrderId: "lab1",
          orderedAt: "2025-05-01",
          status: "pending",
        },
      ],
      alerts: [
        {
          code: "dm-hba1c",
          severity: "warning",
          message: "HbA1c persistentemente elevada en último control",
          source: "rule",
        },
      ],
    };

    const bundle = buildClinicalCopilotIntelligence({
      consultationId: "c2",
      diagnosisCode: "E11.9",
      diagnosisDescription: "Diabetes mellitus tipo 2",
      chiefComplaint: "Control glucémico",
      notes: "Paciente refiere adherencia parcial.",
      treatment: "Ajuste de dosis. Control en 3 meses.",
      clinicalMemoryRaw: memory,
    });

    assert.ok(bundle.insights.some((i) => i.id === "dm2-lab"));
    assert.ok(!bundle.insights.some((i) => i.id === "dm2-rx"));
    assert.ok(!bundle.insights.some((i) => i.id === "dm2-alert"));
    assert.ok(bundle.riskSignals.some((s) => s.id === "risk-alert-dm-hba1c"));
    assert.ok(bundle.riskSignals.some((s) => s.id === "risk-pending-labs"));
  });

  it("Asma — insights refinados sin medicación redundante", () => {
    const memory: PatientClinicalMemory = {
      ...memoryBase("p3"),
      activeConditions: [{ code: "J45", label: "Asma", source: "cie10" }],
      currentMedications: [
        {
          name: "Salbutamol inhalador",
          prescriptionId: "rx2",
          since: "2024-06-01",
        },
        {
          name: "Budesonida/Formoterol",
          prescriptionId: "rx3",
          since: "2024-06-01",
        },
      ],
    };

    const bundle = buildClinicalCopilotIntelligence({
      consultationId: "c3",
      diagnosisCode: "J45.9",
      diagnosisDescription: "Asma no especificada",
      chiefComplaint: "Control asmático",
      notes: "Sin disnea en reposo. MV conservado bilateralmente.",
      treatment: "Continuar inhaladores. Control en 6 meses.",
      clinicalMemoryRaw: memory,
    });

    assert.ok(!bundle.insights.some((i) => i.id === "asma-rx"));
    assert.ok(!bundle.insights.some((i) => i.id === "asma-stable"));
    assert.ok(bundle.insights.some((i) => i.id === "asma-no-exacerbation"));
    assert.ok(bundle.insights.some((i) => i.id === "asma-treatment-persistence"));
  });

  it("Phase 4.7D — anamnesis por contenido clínico, no longitud", () => {
    const bundle = buildClinicalCopilotIntelligence({
      diagnosisCode: "R51",
      diagnosisDescription: "Cefalea",
      chiefComplaint: "Cefalea 2 días",
      notes: "Cefalea opresiva. Neurológico sin focalidad.",
      treatment: "Analgésico PRN.",
      clinicalMemoryRaw: memoryBase("p-47d"),
    });

    const anamnesis = bundle.documentationQuality.factors.find((f) => f.id === "anamnesis");
    assert.ok(anamnesis && anamnesis.points > 0);
    assert.equal(bundle.documentationQuality.label, "Adecuado");
  });

  it("Documentation Quality — score 0–100 con etiqueta coherente", () => {
    const sparse = buildDocumentationQuality(
      {
        diagnosisCode: "I10",
        notes: "Breve",
        clinicalMemoryRaw: memoryBase("p4"),
      },
      {
        activeDiagnosis: "Hipertensión",
        activeDiagnosisCode: "I10",
        activeMedications: [],
        recentTimeline: [],
        pendingLabs: [],
        soapSummary: {
          diagnosis: "Hipertensión",
          plan: "",
          notesPreview: "Breve",
          chiefComplaint: "",
        },
        clinicalMemory: [],
        clinicalMemoryConfidence: null,
        vitalsSummary: null,
        physicalExamSummary: null,
        longitudinalSummary: null,
        doctorDnaObservation: null,
        sources: ["soap"],
      },
    );

    assert.ok(sparse.score < 60);
    assert.equal(sparse.label, "Incompleto");
  });

  it("Phase 4.7B — sin risk-baseline; array vacío sin riesgo real", () => {
    const bundle = buildClinicalCopilotIntelligence({
      diagnosisDescription: "Consulta general",
      chiefComplaint: "Dolor abdominal",
      notes: "Cuadro agudo de 2 días.",
      treatment: "Reposo e hidratación.",
      clinicalMemoryRaw: memoryBase("p5"),
    });

    assert.equal(bundle.riskSignals.length, 0);
    assert.equal(COPILOT_RISK_EMPTY_MESSAGE.length > 0, true);
  });

  it("Phase 4.7B — Copilot Silence Mode cuando no hay output relevante", () => {
    const bundle = buildClinicalCopilotIntelligence({
      diagnosisDescription: "Consulta general",
      chiefComplaint: "Dolor abdominal leve",
      notes: "Cuadro agudo autolimitado de 2 días sin signos de alarma.",
      treatment: "Reposo e hidratación oral.",
      clinicalMemoryRaw: memoryBase("p5b"),
    });

    assert.equal(bundle.insights.length, 0);
    assert.equal(bundle.riskSignals.length, 0);
    assert.equal(bundle.documentationGaps.length, 0);
    assert.equal(bundle.silenceMode, true);
    assert.match(COPILOT_SILENCE_MESSAGE, /Sin observaciones clínicas relevantes/);
  });

  it("EPOC — broncodilatador persistente con evidencia", () => {
    const bundle = buildClinicalCopilotIntelligence({
      consultationId: "c-epoc",
      diagnosisCode: "J44.9",
      diagnosisDescription: "EPOC",
      chiefComplaint: "Disnea",
      notes: "Disnea de esfuerzo.",
      treatment: "Broncodilatador. Control en 2 semanas.",
      clinicalMemoryRaw: {
        ...memoryBase("p-epoc"),
        currentMedications: [
          {
            name: "Tiotropio inhalado",
            prescriptionId: "rx5",
            since: "2023-01-01",
          },
        ],
      },
    });
    assert.ok(bundle.insights.some((i) => i.id === "epoc-treatment-persistence"));
  });

  it("Polifarmacia — observación contextual sin listar medicación redundante", () => {
    const bundle = buildClinicalCopilotIntelligence({
      consultationId: "c-poly",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión",
      chiefComplaint: "Control",
      notes: "Signos vitales: PA 134/84 mmHg.",
      treatment: "Control en 1 mes.",
      clinicalMemoryRaw: {
        ...memoryBase("p-poly"),
        currentMedications: [
          { name: "Losartán", prescriptionId: "r1", since: "2020-01-01" },
          { name: "Amlodipino", prescriptionId: "r2", since: "2020-01-01" },
          { name: "HCTZ", prescriptionId: "r3", since: "2021-01-01" },
          { name: "Atorvastatina", prescriptionId: "r4", since: "2021-01-01" },
          { name: "Aspirina", prescriptionId: "r5", since: "2022-01-01" },
        ],
      },
    });
    const poly = bundle.insights.find((i) => i.id === "polypharmacy-context");
    assert.ok(poly);
    assert.match(poly!.body, /5 medicamentos/);
    assert.ok(!bundle.insights.some((i) => i.id === "hta-vitals"));
  });

  it("Multimorbilidad — ≥3 condiciones con longitudinal", () => {
    const bundle = buildClinicalCopilotIntelligence({
      consultationId: "c-multi",
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión",
      chiefComplaint: "Control crónico",
      notes: "Signos vitales: PA 148/92 mmHg.",
      treatment: "Control en 1 mes.",
      clinicalMemoryRaw: {
        ...memoryBase("p-multi"),
        activeConditions: [
          { code: "I10", label: "HTA", source: "cie10" },
          { code: "E11", label: "DM2", source: "cie10" },
          { code: "E78", label: "Dislipidemia", source: "cie10" },
        ],
        recentConsultations: [
          {
            id: "m1",
            createdAt: "2024-08-15T10:00:00.000Z",
            status: "completed",
            diagnosisCode: "I10",
            diagnosisLabel: "HTA",
          },
          {
            id: "m2",
            createdAt: "2026-04-01T10:00:00.000Z",
            status: "completed",
            diagnosisCode: "E11",
            diagnosisLabel: "DM2",
          },
        ],
      },
    });
    assert.ok(bundle.insights.some((i) => i.id === "multimorbidity-context"));
  });

  it("no emite diagnósticos ni recomendaciones terapéuticas en insights", () => {
    const bundle = buildClinicalCopilotIntelligence({
      diagnosisCode: "I10",
      diagnosisDescription: "Hipertensión",
      notes: "Signos vitales: PA 160/100 mmHg.",
      chiefComplaint: "Control",
      treatment: "Control en 1 mes.",
      clinicalMemoryRaw: memoryBase("p6"),
    });

    const forbidden = /diagnóstico|prescrib|indicar tratamiento|debe tomar/i;
    for (const insight of bundle.insights) {
      assert.doesNotMatch(insight.title, forbidden);
      assert.doesNotMatch(insight.body, forbidden);
    }
  });
});

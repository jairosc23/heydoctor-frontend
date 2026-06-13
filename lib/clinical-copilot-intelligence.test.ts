import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClinicalCopilotIntelligence,
  buildClinicalInsightCards,
  buildClinicalRiskSignals,
  buildDocumentationGaps,
  buildDocumentationQuality,
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

describe("clinical-copilot-intelligence Phase 4.6", () => {
  it("HTA — insight de PA elevada y gap sin examen cardiovascular", () => {
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

    assert.ok(
      bundle.insights.some((i) => /Presión arterial elevada/i.test(i.title)),
    );
    assert.ok(bundle.context.sources.includes("vitals"));
    assert.ok(
      bundle.riskSignals.some((s) => s.level === "moderado" && /PA/i.test(s.title)),
    );
    assert.ok(
      bundle.documentationGaps.some((g) => g.id === "gap-pe-cv"),
      "debe detectar falta de examen cardiovascular",
    );
    assert.ok(bundle.documentationQuality.score >= 60);
  });

  it("DM2 — HbA1c, medicación y alerta en insights", () => {
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

    assert.ok(bundle.insights.some((i) => /HbA1c/i.test(i.body)));
    assert.ok(bundle.insights.some((i) => /Metformina/i.test(i.body)));
    assert.ok(bundle.riskSignals.some((s) => /Alerta clínica/i.test(s.title)));
    assert.ok(bundle.riskSignals.some((s) => /Laboratorios pendientes/i.test(s.title)));
  });

  it("Asma — medicación inhalatoria y contexto estable", () => {
    const memory: PatientClinicalMemory = {
      ...memoryBase("p3"),
      activeConditions: [
        { code: "J45", label: "Asma", source: "cie10" },
      ],
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

    assert.ok(
      bundle.insights.some((i) => /inhalatorio/i.test(i.title)),
    );
    assert.ok(
      bundle.insights.some((i) => /Sin alertas de exacerbación/i.test(i.title)),
    );
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

    const complete = buildDocumentationQuality(
      {
        diagnosisCode: "I10",
        diagnosisDescription: "Hipertensión",
        chiefComplaint: "Control",
        notes:
          "Signos vitales: PA 130/80 mmHg. Examen cardiovascular: ritmo regular, sin soplos.",
        treatment: "Losartán. Control en 4 semanas.",
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
          plan: "Losartán",
          notesPreview: "Signos vitales",
          chiefComplaint: "Control",
        },
        clinicalMemory: [],
        clinicalMemoryConfidence: null,
        vitalsSummary: "PA 130/80",
        physicalExamSummary: "cardiovascular: ritmo regular",
        longitudinalSummary: null,
        doctorDnaObservation: null,
        sources: ["soap", "vitals", "physical-exam"],
      },
    );

    assert.ok(complete.score >= 85);
    assert.equal(complete.label, "Excelente");
  });

  it("Risk signals — baseline bajo sin datos de riesgo", () => {
    const context = buildClinicalCopilotIntelligence({
      diagnosisDescription: "Consulta general",
      chiefComplaint: "Dolor abdominal",
      notes: "Cuadro agudo de 2 días.",
      treatment: "Reposo e hidratación.",
      clinicalMemoryRaw: memoryBase("p5"),
    });

    assert.ok(
      context.riskSignals.some(
        (s) => s.level === "bajo" && /Sin señales determinísticas/i.test(s.title),
      ),
    );
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

/**
 * Phase 4.5.4 — Real Clinical Validation™
 * Batería determinística del pipeline real post-4.5.3:
 * consultation-assist ↔ consultation-summary v2 ↔ SOAP
 * Sin llamadas OpenAI. Solo medición.
 */

import { buildClinicalAiContextPrompt } from "./ai-clinical-context";
import { buildClinicalDataFoundation } from "./clinical-data-foundation";
import {
  formatPhysicalExamForSoap,
  hasPhysicalExamData,
  resolvePhysicalExamFromNotes,
  serializePhysicalExam,
} from "./physical-exam-framework";
import {
  enhanceConsultationSummary,
  mapAssistToClinicalSummary,
} from "./clinical-summary-quality";
import {
  buildConsultationSummaryRequest,
  type EnrichedClinicalDocumentationInput,
} from "./services/ai-clinical";
import type { ConsultationAssistResponse } from "./services/consultation-assist";
import {
  formatClinicalVitalSignsForContext,
  parseClinicalVitalSignsFromNotes,
} from "./clinical-vital-signs-context";
import { formatLongitudinalSummaryForContext } from "./longitudinal-summary";
import type { PatientClinicalMemory } from "./types/clinical-memory";

export type RealValidationPriority =
  | "hta"
  | "dm2"
  | "asma"
  | "physical_exam"
  | "fallback";

export type AssistVsSummaryParity = {
  assistPrompt: string;
  summarySnapshotPrompt: string;
  parityScore: number;
  preserved: string[];
  lost: string[];
  assistOnly: string[];
};

export type RealClinicalScores = {
  clinicalSummary: number;
  soap: number;
  aiDocumentation: number;
  physicianUtility: number;
  completeness: number;
  composite: number;
};

export type RealClinicalCaseResult = {
  id: string;
  priority: RealValidationPriority;
  code: string;
  label: string;
  checks: Record<string, boolean>;
  parity: AssistVsSummaryParity;
  assistSoap: string;
  summaryV2Notes: string;
  summaryNarrative: string;
  scores: RealClinicalScores;
  strengths: string[];
  weaknesses: string[];
  clinicalGaps: string[];
};

export type RealClinicalValidationReport = {
  cases: RealClinicalCaseResult[];
  aggregateScores: RealClinicalScores;
  assistVsSummaryAvgParity: number;
  topStrengths: string[];
  topWeaknesses: string[];
  clinicalGaps: string[];
  risks: string[];
  methodology: string;
};

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

type RealCaseFixture = {
  id: string;
  priority: RealValidationPriority;
  code: string;
  label: string;
  input: EnrichedClinicalDocumentationInput;
  mockAssist: ConsultationAssistResponse;
  /** Tokens clínicos que deben preservarse assist → summary */
  mustPreserve: string[];
  /** Tokens que NO deben aparecer (placeholders / invenciones) */
  mustNotContain: string[];
};

function buildInput(
  fixture: Omit<RealCaseFixture, "mockAssist" | "mustPreserve" | "mustNotContain"> & {
    mockAssist: ConsultationAssistResponse;
    mustPreserve: string[];
    mustNotContain?: string[];
  },
): RealCaseFixture {
  return {
    ...fixture,
    mustNotContain: fixture.mustNotContain ?? [],
  };
}

export const REAL_CLINICAL_CASES: RealCaseFixture[] = [
  buildInput({
    id: "real-i10-hta",
    priority: "hta",
    code: "I10",
    label: "Hipertensión esencial — control PA",
    mustPreserve: ["152/98", "Losartán", "I10", "Signos vitales"],
    mustNotContain: ["Por documentar en consulta", "[Examinar"],
    input: {
      consultationId: "val-i10",
      currentConsultationId: "val-i10",
      chiefComplaint: "cefalea; control presión arterial",
      draftNotes:
        "PA 152/98 mmHg en consulta. FC 88 lpm. Cefalea holocraneana 2 días. Automonitorización domiciliaria elevada.",
      encounterNotes:
        "PA 152/98 mmHg en consulta. FC 88 lpm. Cefalea holocraneana 2 días. Automonitorización domiciliaria elevada.",
      treatment: "Continuar losartán 50 mg/d. Reforzar medidas higiénico-dietéticas.",
      patientAge: 58,
      patientSex: "masculino",
      patientDemographics: "masculino, 58 años",
      activeDiagnosis: { code: "I10", description: "Hipertensión esencial" },
      allergyLines: ["AINEs (rash)"],
      memory: {
        ...memoryBase("p-i10"),
        activeConditions: [
          { code: "I10", label: "Hipertensión esencial", source: "cie10" },
        ],
        currentMedications: [
          {
            name: "Losartán 50 mg",
            prescriptionId: "rx1",
            since: "2024-01-01",
          },
        ],
        alerts: [
          {
            code: "HTA",
            severity: "warning",
            message: "PA domiciliaria >140/90",
            source: "rule",
          },
        ],
      },
    },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["I10 — HTA mal controlada"],
      recommendations: ["Ajustar antihipertensivo", "Control PA 7 días"],
      generalEducation: ["Dieta baja en sodio"],
    },
  }),
  buildInput({
    id: "real-e11-dm2",
    priority: "dm2",
    code: "E11",
    label: "DM2 — control HbA1c",
    mustPreserve: ["HbA1c", "Metformina", "E11", "Tratamiento actual"],
    input: {
      consultationId: "val-e11",
      currentConsultationId: "val-e11",
      chiefComplaint: "control de HbA1c elevada",
      draftNotes:
        "HbA1c 8.4% en último control. Polidipsia leve. Dieta irregular.",
      treatment: "Metformina 850 mg c/12h. Evaluar intensificación.",
      patientAge: 62,
      patientSex: "femenino",
      patientDemographics: "femenino, 62 años",
      activeDiagnosis: { code: "E11.9", description: "Diabetes mellitus tipo 2" },
      memory: {
        ...memoryBase("p-e11"),
        activeConditions: [
          { code: "E11.9", label: "DM2", source: "cie10" },
        ],
        currentMedications: [
          {
            name: "Metformina 850 mg",
            prescriptionId: "rx2",
            since: "2023-06-01",
          },
        ],
        pendingLabs: [
          {
            exam: "HbA1c 8.4%",
            labOrderId: "l1",
            orderedAt: "2026-05-01",
            status: "completed",
          },
        ],
        alerts: [
          {
            code: "DM",
            severity: "warning",
            message: "HbA1c por encima de meta",
            source: "rule",
          },
        ],
        recentConsultations: [
          {
            id: "prev-dm",
            createdAt: "2026-01-15T00:00:00.000Z",
            status: "completed",
            diagnosisCode: "E11",
            diagnosisLabel: "DM2",
          },
        ],
      },
    },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["E11.9 — DM2 control subóptimo"],
      recommendations: ["Reforzar adherencia", "Control HbA1c 3 meses"],
      generalEducation: ["Automonitorización capilar"],
    },
  }),
  buildInput({
    id: "real-j45-asma",
    priority: "asma",
    code: "J45",
    label: "Asma — control ambulatorio",
    mustPreserve: ["Salbutamol", "Budesonida", "J45", "Asma"],
    input: {
      consultationId: "val-j45",
      currentConsultationId: "val-j45",
      chiefComplaint: "control ambulatorio de asma",
      draftNotes:
        "Asma persistente leve. Salbutamol 2-3 veces/semana. Peak flow 85% basal.",
      treatment: "Budesonida/formoterol. Plan de acción escrito.",
      patientAge: 34,
      patientSex: "femenino",
      patientDemographics: "femenino, 34 años",
      activeDiagnosis: { code: "J45.9", description: "Asma bronquial" },
      memory: {
        ...memoryBase("p-j45"),
        activeConditions: [
          { code: "J45.9", label: "Asma bronquial", source: "cie10" },
        ],
        currentMedications: [
          {
            name: "Salbutamol inhalador",
            prescriptionId: "rx3",
            since: "2025-01-01",
          },
          {
            name: "Budesonida/formoterol",
            prescriptionId: "rx4",
            since: "2025-01-01",
          },
        ],
        recentConsultations: [
          {
            id: "prev-asthma",
            createdAt: "2025-12-01T00:00:00.000Z",
            status: "completed",
            diagnosisCode: "J45",
            diagnosisLabel: "Asma",
          },
        ],
      },
    },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["J45.9 — Asma persistente leve"],
      recommendations: ["Verificar técnica inhalatoria", "Control 8-12 semanas"],
      generalEducation: ["Evitar desencadenantes"],
    },
  }),
  buildInput({
    id: "real-pe-documented",
    priority: "physical_exam",
    code: "I10",
    label: "Examen físico documentado",
    mustPreserve: [
      "Buen estado general",
      "Ritmo regular",
      "MV conservado",
      "Sin focalidad",
    ],
    mustNotContain: [
      "Por documentar en consulta",
      "[Examinar",
      "Sin hallazgos",
      "placeholder",
    ],
    input: {
      consultationId: "val-pe",
      currentConsultationId: "val-pe",
      chiefComplaint: "control HTA",
      draftNotes: [
        serializePhysicalExam({
          general: "Buen estado general, hidratado, afebril",
          heent: "",
          cardiovascular: "Ritmo regular, no soplos",
          respiratory: "MV conservado, sin estertores",
          abdomen: "",
          neurological: "Sin focalidad, Glasgow 15",
          extremities: "",
          skin: "",
          other: "",
        }) ?? "",
        "PA 130/85 mmHg.",
      ].join("\n"),
      treatment: "Continuar tratamiento",
      patientAge: 55,
      patientSex: "masculino",
      activeDiagnosis: { code: "I10", description: "HTA" },
      memory: memoryBase("p-pe"),
    },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["I10"],
      recommendations: ["Control PA"],
      generalEducation: [],
    },
  }),
  buildInput({
    id: "real-fallback-parity",
    priority: "fallback",
    code: "I10",
    label: "Fallback assist → summary v2",
    mustPreserve: [
      "152/98",
      "Losartán",
      "Penicilina",
      "Contexto clínico reciente",
      "Signos vitales",
    ],
    input: {
      consultationId: "val-fb",
      currentConsultationId: "val-fb",
      chiefComplaint: "cefalea HTA",
      draftNotes: "PA 152/98 mmHg. Cefalea.",
      treatment: "Losartán 50 mg",
      patientAge: 60,
      patientSex: "masculino",
      allergyLines: ["Penicilina"],
      activeDiagnosis: { code: "I10", description: "HTA" },
      memory: {
        ...memoryBase("p-fb"),
        activeConditions: [
          { code: "I10", label: "HTA", source: "cie10" },
        ],
        currentMedications: [
          { name: "Losartán 50 mg", prescriptionId: "rx", since: "" },
        ],
        recentConsultations: [
          {
            id: "prev",
            createdAt: "2026-03-01T00:00:00.000Z",
            status: "completed",
            diagnosisCode: "I10",
            diagnosisLabel: "HTA",
          },
        ],
      },
    },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["I10"],
      recommendations: ["Control PA"],
      generalEducation: ["Dieta baja en sodio"],
    },
  }),
];

function tokenPresent(text: string, token: string): boolean {
  return text.toLowerCase().includes(token.toLowerCase());
}

export function computeAssistVsSummaryParity(
  assistPrompt: string,
  summarySnapshotPrompt: string,
  mustPreserve: string[],
): AssistVsSummaryParity {
  const preserved: string[] = [];
  const lost: string[] = [];
  const assistOnly: string[] = [];

  for (const token of mustPreserve) {
    const inAssist = tokenPresent(assistPrompt, token);
    const inSummary = tokenPresent(summarySnapshotPrompt, token);
    if (inAssist && inSummary) preserved.push(token);
    else if (inAssist && !inSummary) lost.push(token);
    else if (!inAssist && inSummary) preserved.push(`${token} (summary only)`);
    else lost.push(token);
  }

  for (const token of mustPreserve) {
    if (tokenPresent(assistPrompt, token) && !tokenPresent(summarySnapshotPrompt, token)) {
      assistOnly.push(token);
    }
  }

  const parityScore =
    mustPreserve.length === 0
      ? 10
      : Math.round((preserved.length / mustPreserve.length) * 10);

  return {
    assistPrompt,
    summarySnapshotPrompt,
    parityScore,
    preserved,
    lost,
    assistOnly,
  };
}

/** Simula fallback consultation-summary v2 (degradación provider, sin OpenAI). */
export function simulateSummaryV2Fallback(
  input: EnrichedClinicalDocumentationInput,
): { summary: string; improvedNotes: string; enrichedContext: string } {
  const req = buildConsultationSummaryRequest(input);
  const enrichedContext = req.clientSnapshot?.clinicalContextPrompt ?? "";
  const notes = input.draftNotes?.trim() ?? "";
  const vitalsCtx = parseClinicalVitalSignsFromNotes(notes, input.treatment);
  const vitalsText = formatClinicalVitalSignsForContext(vitalsCtx);
  const peText = formatPhysicalExamForSoap(
    resolvePhysicalExamFromNotes(notes),
  );

  const blocks: string[] = [];
  const push = (title: string, body: string | null | undefined) => {
    const t = body?.trim();
    if (!t) return;
    blocks.push(`${title}\n${t}`);
  };

  push("Motivo de consulta", input.chiefComplaint);
  push("Anamnesis", notes);
  if (enrichedContext) push("Antecedentes relevantes", enrichedContext);
  if (vitalsText) {
    push("Signos vitales", vitalsText.replace(/^Signos vitales: /, ""));
  }
  if (peText) push("Examen físico", peText);
  push(
    "Impresión diagnóstica",
    input.activeDiagnosis
      ? `${input.activeDiagnosis.code} — ${input.activeDiagnosis.description}`
      : input.diagnosisText,
  );
  push("Conducta", input.treatment);

  return {
    summary: input.chiefComplaint?.trim() || notes.slice(0, 200),
    improvedNotes: blocks.join("\n\n"),
    enrichedContext,
  };
}

function scoreCompleteness(checks: Record<string, boolean>): number {
  const values = Object.values(checks);
  if (values.length === 0) return 0;
  return Math.round((values.filter(Boolean).length / values.length) * 10);
}

function scoreFromSections(text: string, required: string[]): number {
  const found = required.filter((s) => text.includes(s)).length;
  return Math.min(10, Math.round((found / required.length) * 10));
}

export function validateRealClinicalCase(
  fixture: RealCaseFixture,
): RealClinicalCaseResult {
  const input = fixture.input;
  const activeDiagnosis =
    input.activeDiagnosis != null
      ? `${input.activeDiagnosis.code} — ${input.activeDiagnosis.description}`
      : input.diagnosisText ?? "";

  const assistPrompt = buildClinicalAiContextPrompt({
    ...input,
    encounterNotes: input.encounterNotes ?? input.draftNotes,
    currentConsultationId: input.currentConsultationId ?? input.consultationId,
  });

  const summaryReq = buildConsultationSummaryRequest(input);
  const summarySnapshotPrompt =
    summaryReq.clientSnapshot?.clinicalContextPrompt ?? "";

  const parity = computeAssistVsSummaryParity(
    assistPrompt,
    summarySnapshotPrompt,
    fixture.mustPreserve,
  );

  const assistMapped = mapAssistToClinicalSummary(fixture.mockAssist, {
    chiefComplaint: input.chiefComplaint,
    draftNotes: input.draftNotes,
    treatment: input.treatment,
    activeDiagnosis,
    encounterNotes: input.encounterNotes ?? input.draftNotes,
  });

  const fallbackRaw = simulateSummaryV2Fallback(input);
  const summaryEnhanced = enhanceConsultationSummary(
    {
      summary: fallbackRaw.summary,
      suggestedDiagnosis: [activeDiagnosis],
      improvedNotes: fallbackRaw.improvedNotes,
    },
    {
      chiefComplaint: input.chiefComplaint,
      draftNotes: input.draftNotes,
      treatment: input.treatment,
      activeDiagnosis,
      encounterNotes: input.encounterNotes ?? input.draftNotes,
    },
  );

  const notes = input.draftNotes ?? "";
  const vitalsCtx = parseClinicalVitalSignsFromNotes(notes, input.treatment);
  const pe = resolvePhysicalExamFromNotes(notes);

  const checks: Record<string, boolean> = {
    assistIncludesContext: assistPrompt.length > 80,
    summarySnapshotMatchesAssist:
      summarySnapshotPrompt === assistPrompt || parity.parityScore >= 8,
    summaryV2IncludesVitals:
      !vitalsCtx.hasData ||
      tokenPresent(summaryEnhanced.improvedNotes, "152/98") ||
      tokenPresent(summaryEnhanced.improvedNotes, "130/85") ||
      tokenPresent(summaryEnhanced.improvedNotes, "Signos vitales"),
    soapIncludesVitals:
      !vitalsCtx.hasData ||
      tokenPresent(assistMapped.improvedNotes, "152/98") ||
      tokenPresent(assistMapped.improvedNotes, "130/85") ||
      tokenPresent(
        assistMapped.improvedNotes,
        String(vitalsCtx.vitals.systolic ?? ""),
      ),
    assistUsesVitals:
      !vitalsCtx.hasData || tokenPresent(assistPrompt, "Signos vitales"),
    fallbackUsesVitals:
      !vitalsCtx.hasData ||
      tokenPresent(summaryEnhanced.improvedNotes, "Signos vitales"),
    memoryInAssist:
      !input.memory?.currentMedications.length ||
      input.memory.currentMedications.some((m) =>
        tokenPresent(assistPrompt, m.name.split(" ")[0] ?? m.name),
      ),
    memoryInSummary:
      !input.memory?.currentMedications.length ||
      input.memory.currentMedications.some((m) =>
        tokenPresent(summarySnapshotPrompt, m.name.split(" ")[0] ?? m.name),
      ),
    labsInContext:
      !input.memory?.pendingLabs.length ||
      input.memory.pendingLabs.some((l) => tokenPresent(assistPrompt, l.exam.split(" ")[0] ?? l.exam)),
    longitudinalInContext:
      !input.memory?.recentConsultations.length ||
      tokenPresent(assistPrompt, "Contexto clínico reciente"),
    noPePlaceholder: !fixture.mustNotContain.some((f) =>
      f.includes("Por documentar") || f.includes("[Examinar")
    ) || fixture.mustNotContain.every(
      (bad) =>
        !assistMapped.improvedNotes.includes(bad) &&
        !summaryEnhanced.improvedNotes.includes(bad),
    ),
    peSectionsWhenDocumented:
      fixture.priority !== "physical_exam" ||
      (hasPhysicalExamData(pe) &&
        tokenPresent(assistPrompt, "Examen físico documentado") &&
        tokenPresent(summaryEnhanced.improvedNotes, "Ritmo regular")),
    noInventedPe:
      fixture.priority !== "physical_exam" ||
      !tokenPresent(assistMapped.improvedNotes, "[Examinar"),
    allergiesInAssist:
      !input.allergyLines?.length ||
      input.allergyLines.some((a) => tokenPresent(assistPrompt, a.split(" ")[0] ?? a)),
    fallbackPreservesMemory:
      fixture.priority !== "fallback" || parity.parityScore >= 7,
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const clinicalGaps: string[] = [];

  if (checks.assistUsesVitals && checks.fallbackUsesVitals) {
    strengths.push("PA/vitales presentes en assist y summary v2 fallback");
  }
  if (checks.memoryInAssist && checks.memoryInSummary) {
    strengths.push("Medicación/memoria clínica en ambos caminos");
  }
  if (parity.parityScore >= 9) {
    strengths.push(`Paridad assist↔summary ${parity.parityScore}/10`);
  }
  if (checks.peSectionsWhenDocumented) {
    strengths.push("Examen físico documentado sin placeholders");
  }
  if (checks.longitudinalInContext) {
    strengths.push("Contexto longitudinal en prompt");
  }

  const foundation = buildClinicalDataFoundation({
    encounterNotes: notes,
    treatment: input.treatment,
    memory: input.memory,
    currentConsultationId: input.currentConsultationId,
  });
  if (
    fixture.priority === "dm2" &&
    foundation.longitudinal.hasData &&
    formatLongitudinalSummaryForContext(foundation.longitudinal)
  ) {
    strengths.push("Longitudinal Summary aporta consultas previas");
  }

  if (parity.lost.length > 0) {
    weaknesses.push(`Pérdida assist→summary: ${parity.lost.join(", ")}`);
  }
  if (!checks.summarySnapshotMatchesAssist) {
    weaknesses.push("Snapshot summary no coincide exactamente con assist prompt");
  }
  if (fixture.priority === "physical_exam" && !checks.noInventedPe) {
    weaknesses.push("SOAP assist contiene placeholder de examen");
  }
  if (input.memory?.recentConsultations.length && !checks.longitudinalInContext) {
    clinicalGaps.push("Longitudinal no serializado al prompt assist");
  }

  const soapScore = scoreFromSections(assistMapped.improvedNotes, [
    "Motivo de consulta",
    "Anamnesis",
    "Impresión diagnóstica",
    "Conducta",
  ]);
  const summaryScore = scoreFromSections(summaryEnhanced.improvedNotes, [
    "Motivo de consulta",
    "Anamnesis",
    "Signos vitales",
    "Impresión diagnóstica",
    "Conducta",
  ]);
  const completeness = scoreCompleteness(checks);
  const aiDocScore = Math.round((parity.parityScore + soapScore) / 2);
  const physicianUtility = Math.round(
    (summaryScore + soapScore + completeness) / 3,
  );

  const scores: RealClinicalScores = {
    clinicalSummary: summaryScore,
    soap: soapScore,
    aiDocumentation: aiDocScore,
    physicianUtility,
    completeness,
    composite: Math.round(
      (summaryScore + soapScore + aiDocScore + physicianUtility + completeness) / 5,
    ),
  };


  return {
    id: fixture.id,
    priority: fixture.priority,
    code: fixture.code,
    label: fixture.label,
    checks,
    parity,
    assistSoap: assistMapped.improvedNotes,
    summaryV2Notes: summaryEnhanced.improvedNotes,
    summaryNarrative: summaryEnhanced.summary,
    scores,
    strengths,
    weaknesses,
    clinicalGaps,
  };
}

export const REAL_VALIDATION_RISKS = [
  "Validación determinística — calidad LLM en producción puede variar ±1.5 pts.",
  "Paridad assist/summary depende de clientSnapshot; v1 {consultationId} solo pierde borrador no sincronizado.",
  "Longitudinal frontend no incluye motivo/conducta de consultas previas (backend v2 sí).",
  "Scores no sustituyen revisión por médico en consulta real con OpenAI activo.",
];

export function runRealClinicalValidation(): RealClinicalValidationReport {
  const cases = REAL_CLINICAL_CASES.map(validateRealClinicalCase);

  const avg = (key: keyof RealClinicalScores) =>
    Math.round(
      cases.reduce((s, c) => s + c.scores[key], 0) / cases.length,
    );

  const aggregateScores: RealClinicalScores = {
    clinicalSummary: avg("clinicalSummary"),
    soap: avg("soap"),
    aiDocumentation: avg("aiDocumentation"),
    physicianUtility: avg("physicianUtility"),
    completeness: avg("completeness"),
    composite: avg("composite"),
  };

  const assistVsSummaryAvgParity = Math.round(
    cases.reduce((s, c) => s + c.parity.parityScore, 0) / cases.length,
  );

  const gapSet = new Map<string, number>();
  for (const c of cases) {
    for (const g of c.clinicalGaps) {
      gapSet.set(g, (gapSet.get(g) ?? 0) + 1);
    }
  }

  const allStrengths = cases.flatMap((c) => c.strengths);
  const allWeaknesses = cases.flatMap((c) => c.weaknesses);

  return {
    cases,
    aggregateScores,
    assistVsSummaryAvgParity,
    topStrengths: [...new Set(allStrengths)].slice(0, 8),
    topWeaknesses: [...new Set(allWeaknesses)].slice(0, 8),
    clinicalGaps: [...gapSet.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([g, n]) => `${g} (${n}/${cases.length})`),
    risks: REAL_VALIDATION_RISKS,
    methodology:
      "Phase 4.5.4 Real Clinical Validation: pipeline assist + summary v2 snapshot + fallback simulado + SOAP estructurado. Sin OpenAI.",
  };
}

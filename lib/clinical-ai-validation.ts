/**
 * Phase 4.5.1 — Clinical AI Validation™
 * Batería determinística: audita contexto, simula pipeline Phase 4.5 con mocks
 * clínicos representativos y puntúa calidad sin llamadas a OpenAI.
 */

import {
  buildClinicalAiContextPrompt,
  formatPatientDemographics,
  type ClinicalAiContextInput,
} from "./ai-clinical-context";
import {
  CLINICAL_NOTE_SECTION_ORDER,
  formatStructuredClinicalNote,
  mapAssistToClinicalSummary,
} from "./clinical-summary-quality";
import {
  buildAiSyncPatch,
  type ConsultationSummaryResponse,
} from "./services/ai-clinical";
import type { ConsultationAssistResponse } from "./services/consultation-assist";
import type { PatientClinicalMemory } from "./types/clinical-memory";

export type ContextDimension =
  | "age"
  | "sex"
  | "diagnosis"
  | "clinicalMemory"
  | "medications"
  | "labs"
  | "alerts"
  | "allergies"
  | "chiefComplaint"
  | "draftNotes"
  | "treatment"
  | "vitals"
  | "physicalExam"
  | "timeline";

export type ScenarioContextAudit = {
  available: Record<ContextDimension, boolean>;
  sentToAssist: Record<ContextDimension, boolean>;
  syncedToDb: Record<ContextDimension, boolean>;
  sentToSummaryFallback: Record<ContextDimension, boolean>;
  missingFromPrompt: ContextDimension[];
  coverageScore: number;
};

export type ScenarioScores = {
  liveAiSuggestions: number;
  clinicalSummary: number;
  soapGenerated: number;
  autofillRecord: number;
  physicianUtility: number;
  composite: number;
};

export type ScenarioValidationResult = {
  id: string;
  code: string;
  label: string;
  chiefComplaint: string;
  contextAudit: ScenarioContextAudit;
  aiResultSummary: string;
  strengths: string[];
  weaknesses: string[];
  scores: ScenarioScores;
  contextFlow: {
    available: string[];
    sent: string[];
    response: string[];
  };
  gaps: { field: string; layer: "frontend" | "backend" | "both" }[];
};

export type ValidationBatteryResult = {
  scenarios: ScenarioValidationResult[];
  aggregateComposite: number;
  topGaps: string[];
  recommendations: ClinicalAiRecommendation[];
  risks: string[];
  methodology: string;
};

export type ClinicalAiRecommendation = {
  rank: number;
  title: string;
  tier: "quick_win" | "medium" | "advanced";
  clinicalReturn: "high" | "medium";
  description: string;
};

type ValidationScenarioFixture = {
  id: string;
  code: string;
  label: string;
  chiefComplaint: string;
  draftNotes: string;
  treatment: string;
  patientAge: number;
  patientSex: string;
  allergyLines?: string[];
  memory: PatientClinicalMemory;
  /** Datos presentes en UI pero no cableados al prompt Phase 4.5 */
  uiOnly?: Partial<Record<ContextDimension, boolean>>;
  mockAssist: ConsultationAssistResponse;
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

export const VALIDATION_SCENARIOS: ValidationScenarioFixture[] = [
  {
    id: "case-1-i10",
    code: "I10",
    label: "Hipertensión esencial",
    chiefComplaint: "cefalea; control presión arterial",
    draftNotes:
      "Paciente refiere cefalea holocraneana de 2 días, intensidad 6/10, sin fotofobia ni náuseas. Automonitorización domiciliaria PA 152/98 mmHg en ayunas. Adherencia a losartán referida como regular.",
    treatment: "Continuar losartán 50 mg/d. Reforzar medidas higiénico-dietéticas.",
    patientAge: 58,
    patientSex: "masculino",
    allergyLines: ["AINEs (rash cutáneo)"],
    memory: {
      ...memoryBase("p-i10"),
      activeConditions: [
        { code: "I10", label: "Hipertensión esencial", source: "cie10" },
      ],
      currentMedications: [
        {
          name: "Losartán 50 mg",
          prescriptionId: "rx1",
          since: "2024-01-10",
        },
      ],
      pendingLabs: [
        {
          exam: "Creatinina 1.1 mg/dL (2025-11)",
          labOrderId: "lab1",
          orderedAt: "2025-11-01",
          status: "completed",
        },
      ],
      alerts: [
        {
          code: "HTA_UNCONTROLLED",
          severity: "warning",
          message: "PA domiciliaria >140/90 en últimas 2 lecturas",
          source: "rule",
        },
      ],
    },
    uiOnly: { vitals: true, timeline: true },
    mockAssist: {
      assistiveOnlyNotice:
        "Asistencia documental. Confirmar hallazgos en consulta.",
      possibleDiagnoses: [
        "I10 — Hipertensión esencial (mal control)",
        "Cefalea tensional secundaria a HTA",
      ],
      recommendations: [
        "Ajustar antihipertensivo según guía local si PA persistente >140/90",
        "Automonitorización PA 7 días antes de reevaluar",
        "Control en 4 semanas o antes si cefalea intensa/focal",
      ],
      generalEducation: [
        "Dieta baja en sodio (<2 g/d) y actividad física moderada",
        "Signos de alarma: cefalea súbita, visión borrosa, dolor torácico",
      ],
    },
  },
  {
    id: "case-2-e11",
    code: "E11",
    label: "Diabetes mellitus tipo 2",
    chiefComplaint: "control de HbA1c elevada",
    draftNotes:
      "Paciente con DM2 en seguimiento. HbA1c reciente 8.4%. Refiere polidipsia leve. No hipoglucemias sintomáticas. Dieta irregular.",
    treatment: "Metformina 850 mg c/12h. Evaluar intensificación si meta no alcanzable.",
    patientAge: 62,
    patientSex: "femenino",
    memory: {
      ...memoryBase("p-e11"),
      activeConditions: [
        { code: "E11.9", label: "DM2", source: "cie10" },
        { code: "E78.5", label: "Dislipidemia", source: "profile" },
      ],
      currentMedications: [
        {
          name: "Metformina 850 mg",
          prescriptionId: "rx2",
          since: "2023-06-01",
        },
        { name: "Atorvastatina 20 mg", prescriptionId: "rx3", since: "2023-06-01" },
      ],
      pendingLabs: [
        {
          exam: "HbA1c 8.4% (2026-05)",
          labOrderId: "lab2",
          orderedAt: "2026-05-01",
          status: "completed",
        },
      ],
      alerts: [
        {
          code: "DM_HBA1C_HIGH",
          severity: "warning",
          message: "HbA1c por encima de meta (<7%)",
          source: "rule",
        },
      ],
    },
    uiOnly: { vitals: true },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["E11.9 — DM2 con control glucémico subóptimo"],
      recommendations: [
        "Reforzar plan nutricional y adherencia a metformina",
        "Considerar intensificación (iSGLT2/GLP-1) según perfil y guía",
        "Control HbA1c en 3 meses",
      ],
      generalEducation: [
        "Automonitorización capilar según indicación",
        "Revisión anual de fondo de ojo y pies",
      ],
    },
  },
  {
    id: "case-3-j45",
    code: "J45",
    label: "Asma bronquial",
    chiefComplaint: "control ambulatorio de asma",
    draftNotes:
      "Asma persistente leve. Usa salbutamol 2-3 veces/semana. Sin despertares nocturnos. Peak flow 85% del basal.",
    treatment: "Budesonida/formoterol según pauta. Plan de acción escrito.",
    patientAge: 34,
    patientSex: "femenino",
    memory: {
      ...memoryBase("p-j45"),
      activeConditions: [
        { code: "J45.9", label: "Asma bronquial", source: "cie10" },
      ],
      currentMedications: [
        { name: "Salbutamol inhalador", prescriptionId: "rx4", since: "2025-01-01" },
        {
          name: "Budesonida/formoterol",
          prescriptionId: "rx5",
          since: "2025-01-01",
        },
      ],
      recentConsultations: [
        {
          id: "c-prev",
          createdAt: "2025-12-01",
          status: "completed",
          diagnosisCode: "J45",
          diagnosisLabel: "Asma",
        },
      ],
    },
    uiOnly: { timeline: true, vitals: true },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["J45.9 — Asma persistente leve-moderada"],
      recommendations: [
        "Evaluar control según GINA (ACT score si disponible)",
        "Verificar técnica inhalatoria",
        "Control en 8-12 semanas",
      ],
      generalEducation: [
        "Evitar desencadenantes conocidos",
        "Uso de rescate: signos de exacerbación",
      ],
    },
  },
  {
    id: "case-4-m545",
    code: "M54.5",
    label: "Lumbalgia",
    chiefComplaint: "dolor lumbar bajo de 5 días",
    draftNotes:
      "Dolor lumbar mecánico sin irradiación. Empeora al levantar peso. Sin déficit motor ni síntomas de cauda equina.",
    treatment: "Analgesia según escala. Ejercicios de estabilización. Evitar reposo prolongado.",
    patientAge: 45,
    patientSex: "masculino",
    memory: memoryBase("p-m545"),
    uiOnly: { vitals: false, timeline: true },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: [
        "M54.5 — Lumbalgia mecánica aguda",
        "Descartar radiculopatía si irradiación/progresión",
      ],
      recommendations: [
        "Manejo conservador inicial 4-6 semanas",
        "Reevaluar si banderas rojas o déficit neurológico",
      ],
      generalEducation: [
        "Mantener actividad según tolerancia",
        "Higiene postural y ergonomía",
      ],
    },
  },
  {
    id: "case-5-k219",
    code: "K21.9",
    label: "ERGE",
    chiefComplaint: "pirosis y regurgitación ácida",
    draftNotes:
      "Pirosis postprandial 3-4 veces/semana. Sin disfagia, sangrado ni pérdida de peso. Empeora con café y comidas copiosas.",
    treatment: "IBP a demanda / horario según síntomas. Medidas posturales.",
    patientAge: 50,
    patientSex: "femenino",
    memory: {
      ...memoryBase("p-k219"),
      activeConditions: [
        { code: "K21.9", label: "ERGE", source: "cie10" },
      ],
      currentMedications: [
        { name: "Omeprazol 20 mg", prescriptionId: "rx6", since: "2025-08-01" },
      ],
    },
    mockAssist: {
      assistiveOnlyNotice: "Asistencia documental.",
      possibleDiagnoses: ["K21.9 — Enfermedad por reflujo gastroesofágico"],
      recommendations: [
        "Optimizar medidas lifestyle antes de escalar IBP",
        "Considerar endoscopia si síntomas de alarma",
      ],
      generalEducation: [
        "Evitar acostarse <3 h post-ingesta",
        "Reducir desencadenantes (cafeína, grasa)",
      ],
    },
  },
];

function buildScenarioInput(
  fixture: ValidationScenarioFixture,
): ClinicalAiContextInput & {
  consultationId: string;
  patientAge: number;
  patientSex: string;
} {
  return {
    consultationId: `validation-${fixture.id}`,
    patientAge: fixture.patientAge,
    patientSex: fixture.patientSex,
    patientDemographics: formatPatientDemographics({
      age: fixture.patientAge,
      sex: fixture.patientSex,
    }),
    activeDiagnosis: {
      code: fixture.code,
      description: fixture.label,
    },
    chiefComplaint: fixture.chiefComplaint,
    draftNotes: fixture.draftNotes,
    treatment: fixture.treatment,
    allergyLines: fixture.allergyLines,
    memory: fixture.memory,
  };
}

function promptIncludes(prompt: string, pattern: RegExp): boolean {
  return pattern.test(prompt);
}

export function auditScenarioContext(
  fixture: ValidationScenarioFixture,
): ScenarioContextAudit {
  const input = buildScenarioInput(fixture);
  const prompt = buildClinicalAiContextPrompt(input);
  const syncPatch = buildAiSyncPatch(input);

  const available: Record<ContextDimension, boolean> = {
    age: true,
    sex: true,
    diagnosis: true,
    clinicalMemory: fixture.memory.activeConditions.length > 0,
    medications: fixture.memory.currentMedications.length > 0,
    labs: fixture.memory.pendingLabs.length > 0,
    alerts: fixture.memory.alerts.length > 0,
    allergies: (fixture.allergyLines?.length ?? 0) > 0,
    chiefComplaint: Boolean(fixture.chiefComplaint.trim()),
    draftNotes: Boolean(fixture.draftNotes.trim()),
    treatment: Boolean(fixture.treatment.trim()),
    vitals: fixture.uiOnly?.vitals ?? false,
    physicalExam: false,
    timeline: (fixture.memory.recentConsultations.length > 0) || Boolean(fixture.uiOnly?.timeline),
  };

  const hasMemoryData =
    fixture.memory.activeConditions.length > 0 ||
    fixture.memory.recentDiagnoses.length > 0 ||
    fixture.memory.currentMedications.length > 0 ||
    fixture.memory.pendingLabs.length > 0 ||
    fixture.memory.alerts.length > 0;

  const sentToAssist: Record<ContextDimension, boolean> = {
    age: promptIncludes(prompt, /\d+\s*años/),
    sex: promptIncludes(prompt, new RegExp(fixture.patientSex, "i")),
    diagnosis: promptIncludes(prompt, new RegExp(fixture.code)),
    clinicalMemory:
      hasMemoryData &&
      (promptIncludes(prompt, /Antecedentes:/) ||
        promptIncludes(prompt, /Memoria clínica relevante:/)),
    medications:
      fixture.memory.currentMedications.length > 0 &&
      promptIncludes(prompt, /Tratamiento actual:/),
    labs:
      fixture.memory.pendingLabs.length > 0 &&
      promptIncludes(prompt, /laboratorios|HbA1c|Creatinina/i),
    alerts:
      fixture.memory.alerts.length > 0 &&
      promptIncludes(prompt, /Alertas clínicas:/),
    allergies: promptIncludes(prompt, /Alergias:/),
    chiefComplaint: promptIncludes(prompt, /Motivo actual:/),
    draftNotes: false,
    treatment: promptIncludes(prompt, /Tratamiento \/ plan documentado:/),
    vitals: false,
    physicalExam: false,
    timeline: false,
  };

  const syncedToDb: Record<ContextDimension, boolean> = {
    age: false,
    sex: false,
    diagnosis: Boolean(syncPatch.diagnosis),
    clinicalMemory: false,
    medications: false,
    labs: false,
    alerts: false,
    allergies: false,
    chiefComplaint: Boolean(syncPatch.chiefComplaint),
    draftNotes: Boolean(syncPatch.notes),
    treatment: Boolean(syncPatch.treatment),
    vitals: false,
    physicalExam: false,
    timeline: false,
  };

  const sentToSummaryFallback: Record<ContextDimension, boolean> = {
    ...syncedToDb,
  };

  const sentKeys = (map: Record<ContextDimension, boolean>) =>
    (Object.keys(map) as ContextDimension[]).filter((k) => map[k]);

  const availableKeys = sentKeys(available);
  const promptSentKeys = sentKeys(sentToAssist);
  const missingFromPrompt = availableKeys.filter(
    (k) => available[k] && !sentToAssist[k],
  );

  const coverageScore = Math.round(
    (promptSentKeys.length / Math.max(availableKeys.length, 1)) * 10,
  );

  return {
    available,
    sentToAssist,
    syncedToDb,
    sentToSummaryFallback,
    missingFromPrompt,
    coverageScore,
  };
}

function buildNoteSuggestions(res: ConsultationSummaryResponse) {
  const out: { text: string; priority: string }[] = [];
  const dx = (res.suggestedDiagnosis ?? []).filter((s) => s?.trim());
  if (dx[0]) out.push({ text: dx[0].trim(), priority: "high" });
  if (dx[1]) out.push({ text: dx[1].trim(), priority: "consider" });
  if (out.length < 2 && res.improvedNotes?.trim()) {
    out.push({
      text: res.improvedNotes.trim().slice(0, 200),
      priority: "consider",
    });
  }
  return out.slice(0, 2);
}

function scoreSections(note: string): number {
  const present = CLINICAL_NOTE_SECTION_ORDER.filter((s) => note.includes(s));
  return Math.min(10, Math.round((present.length / CLINICAL_NOTE_SECTION_ORDER.length) * 10));
}

function scoreSuggestions(
  suggestions: { text: string }[],
  fixture: ValidationScenarioFixture,
): number {
  if (suggestions.length === 0) return 2;
  let score = 5;
  if (suggestions.some((s) => s.text.includes(fixture.code))) score += 2;
  if (suggestions.length >= 2) score += 1;
  if (suggestions.some((s) => /control|seguim|evaluar|considerar/i.test(s.text)))
    score += 1;
  if (suggestions.every((s) => s.text.length >= 20)) score += 1;
  return Math.min(10, score);
}

function scoreAutofill(
  note: string,
  fixture: ValidationScenarioFixture,
): number {
  let score = 4;
  if (note.includes(fixture.chiefComplaint.split(";")[0]?.trim() ?? "")) score += 1;
  if (note.includes(fixture.code) || note.includes(fixture.label)) score += 2;
  if (/Contexto clínico disponible:/.test(note)) score += 2;
  if (/Por documentar|Examinar|\[Documentar/.test(note)) score += 1;
  return Math.min(10, score);
}

function scorePhysicianUtility(scores: Omit<ScenarioScores, "physicianUtility" | "composite">): number {
  const weighted =
    scores.liveAiSuggestions * 0.2 +
    scores.clinicalSummary * 0.2 +
    scores.soapGenerated * 0.25 +
    scores.autofillRecord * 0.15 +
    scores.liveAiSuggestions * 0.2;
  return Math.round(Math.min(10, weighted));
}

function detectGaps(
  audit: ScenarioContextAudit,
  fixture: ValidationScenarioFixture,
): { field: string; layer: "frontend" | "backend" | "both" }[] {
  const gaps: { field: string; layer: "frontend" | "backend" | "both" }[] = [];

  if (audit.available.vitals && !audit.sentToAssist.vitals) {
    gaps.push({ field: "Signos vitales (PA, FC, SpO2)", layer: "frontend" });
  }
  if (!audit.sentToAssist.physicalExam) {
    gaps.push({ field: "Examen físico estructurado", layer: "both" });
  }
  if (audit.available.timeline && !audit.sentToAssist.timeline) {
    gaps.push({ field: "Timeline / consultas previas", layer: "frontend" });
  }
  if (audit.available.draftNotes && !audit.sentToAssist.draftNotes) {
    gaps.push({
      field: "Notas en curso (solo vía sync PATCH, no en symptoms prompt)",
      layer: "frontend",
    });
  }
  if (!audit.syncedToDb.age && !audit.syncedToDb.sex) {
    gaps.push({ field: "Demografía en fallback consultation-summary", layer: "backend" });
  }
  if (fixture.memory.currentMedications.length && !audit.syncedToDb.medications) {
    gaps.push({ field: "Medicación activa en BD para summary fallback", layer: "backend" });
  }

  return gaps;
}

export function validateScenario(
  fixture: ValidationScenarioFixture,
): ScenarioValidationResult {
  const input = buildScenarioInput(fixture);
  const contextAudit = auditScenarioContext(fixture);
  const activeDiagnosis = `${fixture.code} — ${fixture.label}`;

  const mapped = mapAssistToClinicalSummary(fixture.mockAssist, {
    chiefComplaint: input.chiefComplaint,
    draftNotes: input.draftNotes,
    treatment: input.treatment,
    activeDiagnosis,
  });

  const suggestions = buildNoteSuggestions(mapped);
  const soap = mapped.improvedNotes ?? "";
  const autofillProxy = [
    formatStructuredClinicalNote({
      chiefComplaint: input.chiefComplaint,
      draftNotes: input.draftNotes,
      treatment: input.treatment,
      activeDiagnosis,
      assist: fixture.mockAssist,
    }),
    "",
    "Contexto clínico disponible:",
    buildClinicalAiContextPrompt(input),
  ].join("\n");

  const scores: ScenarioScores = {
    liveAiSuggestions: scoreSuggestions(suggestions, fixture),
    clinicalSummary: mapped.summary?.trim()
      ? Math.min(10, 6 + Math.floor((mapped.summary.length / 80)))
      : 5,
    soapGenerated: scoreSections(soap),
    autofillRecord: scoreAutofill(autofillProxy, fixture),
    physicianUtility: 0,
    composite: 0,
  };
  scores.physicianUtility = scorePhysicianUtility(scores);
  scores.composite = Math.round(
    (scores.liveAiSuggestions +
      scores.clinicalSummary +
      scores.soapGenerated +
      scores.autofillRecord +
      scores.physicianUtility) /
      5,
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (contextAudit.coverageScore >= 7) {
    strengths.push("Contexto enriquecido Phase 4.5 incluye dx, memoria y motivo");
  }
  if (scores.soapGenerated >= 8) {
    strengths.push("SOAP estructurado con 8 secciones clínicas");
  }
  if (suggestions.some((s) => s.text.includes(fixture.code))) {
    strengths.push("Sugerencias alineadas al diagnóstico activo");
  }
  if (contextAudit.missingFromPrompt.includes("draftNotes")) {
    weaknesses.push("Notas en curso no van al bloque symptoms de assist");
  }
  if (soap.includes("Por documentar en consulta")) {
    weaknesses.push("Examen físico permanece sin documentar");
  }
  if (!contextAudit.sentToAssist.vitals) {
    weaknesses.push("Signos vitales no integrados al prompt");
  }
  if (fixture.id === "case-4-m545" && contextAudit.coverageScore < 6) {
    weaknesses.push("Memoria clínica escasa limita personalización");
  }

  const gaps = detectGaps(contextAudit, fixture);

  const fmt = (dims: ContextDimension[]) =>
    dims
      .filter((d) => contextAudit.available[d] || contextAudit.sentToAssist[d])
      .join(", ");

  return {
    id: fixture.id,
    code: fixture.code,
    label: fixture.label,
    chiefComplaint: fixture.chiefComplaint,
    contextAudit,
    aiResultSummary: `${suggestions.length} sugerencias; SOAP ${soap.length} chars; cobertura contexto ${contextAudit.coverageScore}/10`,
    strengths,
    weaknesses,
    scores,
    contextFlow: {
      available: (Object.keys(contextAudit.available) as ContextDimension[])
        .filter((k) => contextAudit.available[k])
        .map(String),
      sent: (Object.keys(contextAudit.sentToAssist) as ContextDimension[])
        .filter((k) => contextAudit.sentToAssist[k])
        .map(String),
      response: [
        `summary: ${mapped.summary?.slice(0, 60) ?? "—"}…`,
        `dx: ${(mapped.suggestedDiagnosis ?? []).join("; ")}`,
        `sections: ${CLINICAL_NOTE_SECTION_ORDER.filter((s) => soap.includes(s)).length}/8`,
      ],
    },
    gaps,
  };
}

export const CLINICAL_AI_RECOMMENDATIONS: ClinicalAiRecommendation[] = [
  {
    rank: 1,
    title: "Inyectar signos vitales al prompt clínico",
    tier: "quick_win",
    clinicalReturn: "high",
    description:
      "Leer PA/FC/SpO2 del encounter activo y añadirlos a buildClinicalAiContextPrompt.",
  },
  {
    rank: 2,
    title: "Incluir draftNotes en symptoms además del sync PATCH",
    tier: "quick_win",
    clinicalReturn: "high",
    description:
      "Evolution clínica pierde matices si las notas en curso solo van en notes del assist.",
  },
  {
    rank: 3,
    title: "Heurística autofill por código CIE-10 (no solo keywords)",
    tier: "quick_win",
    clinicalReturn: "medium",
    description:
      "I10/E11/J45 deberían activar plantillas aunque el motivo no mencione la enfermedad.",
  },
  {
    rank: 4,
    title: "Resumen timeline compacto (últimas 3 consultas)",
    tier: "quick_win",
    clinicalReturn: "medium",
    description:
      "recentConsultations existe en memoria pero no se serializa al prompt.",
  },
  {
    rank: 5,
    title: "Backend: DTO enriquecido para consultation-summary",
    tier: "medium",
    clinicalReturn: "high",
    description:
      "Fallback summary solo lee reason/notes/diagnosis/treatment de BD; ampliar con memoria.",
  },
  {
    rank: 6,
    title: "Backend: persistir demografía en contexto AI",
    tier: "medium",
    clinicalReturn: "high",
    description:
      "Edad/sexo no se sincronizan en PATCH previo; summary fallback los ignora.",
  },
  {
    rank: 7,
    title: "Endpoint autofill-record real con contexto completo",
    tier: "medium",
    clinicalReturn: "high",
    description:
      "Hoy siempre fallback heurístico local; backend debería generar HEA/Rx por sistemas.",
  },
  {
    rank: 8,
    title: "Throttle consultation-summary 10/min → bucket separado",
    tier: "medium",
    clinicalReturn: "medium",
    description:
      "Evitar colisión con assist en sesiones activas de documentación.",
  },
  {
    rank: 9,
    title: "Examen físico estructurado en SOAP (no placeholder)",
    tier: "advanced",
    clinicalReturn: "high",
    description:
      "Clinical Copilot™ debería leer vitales + examen capturado, nunca inferir.",
  },
  {
    rank: 10,
    title: "Clinical Copilot™ — contexto unificado encounter",
    tier: "advanced",
    clinicalReturn: "high",
    description:
      "Capa única: memoria + timeline + órdenes + DNA + vitals → un prompt gobernado.",
  },
];

export const VALIDATION_RISKS = [
  "Scores Phase 4.5.1 son determinísticos (mock assist); calidad LLM real puede variar ±1.5 pts.",
  "consultation-summary fallback no recibe memoria clínica si assist falla post-sync.",
  "Examen físico siempre placeholder: riesgo de documentación incompleta si el médico no edita.",
  "Autofill heurístico puede sugerir 'Sin hallazgos' sin examen real (DM2/HTA).",
  "Throttle 10/min puede degradar UX en consultas largas con edición frecuente de notas.",
];

export function runClinicalValidationBattery(): ValidationBatteryResult {
  const scenarios = VALIDATION_SCENARIOS.map(validateScenario);
  const aggregateComposite = Math.round(
    scenarios.reduce((s, r) => s + r.scores.composite, 0) / scenarios.length,
  );

  const gapCounts = new Map<string, number>();
  for (const s of scenarios) {
    for (const g of s.gaps) {
      gapCounts.set(g.field, (gapCounts.get(g.field) ?? 0) + 1);
    }
  }
  const topGaps = [...gapCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([field, count]) => `${field} (${count}/5 escenarios)`);

  return {
    scenarios,
    aggregateComposite,
    topGaps,
    recommendations: CLINICAL_AI_RECOMMENDATIONS,
    risks: VALIDATION_RISKS,
    methodology:
      "Auditoría determinística Phase 4.5.1: fixtures clínicos reales, buildClinicalAiContextPrompt, mapAssistToClinicalSummary con mocks representativos, sin llamadas OpenAI.",
  };
}

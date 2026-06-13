/**
 * Phase 4.6 — Clinical Copilot Intelligence™
 * Phase 4.7B — Noise Reduction
 * Phase 4.7C — Clinical Coverage (evidencia documentada únicamente)
 */

import { buildClinicalDataFoundation } from "./clinical-data-foundation";
import type { ClinicalMemoryView } from "./clinical-memory";
import { clinicalMemoryConfidenceLabel } from "./clinical-memory";
import type { DoctorDnaIntelligenceView } from "./doctor-dna-intelligence";
import {
  hasPhysicalExamData,
  resolvePhysicalExamFromNotes,
} from "./physical-exam-framework";
import {
  parseClinicalVitalSignsFromNotes,
} from "./clinical-vital-signs-context";
import type { PatientClinicalMemory } from "./types/clinical-memory";

export type CopilotContextSource =
  | "soap"
  | "timeline"
  | "doctor-dna"
  | "orders"
  | "patient-snapshot"
  | "clinical-memory"
  | "vitals"
  | "physical-exam"
  | "longitudinal";

export type CopilotContextView = {
  activeDiagnosis: string | null;
  activeDiagnosisCode: string | null;
  activeMedications: string[];
  recentTimeline: string[];
  pendingLabs: string[];
  soapSummary: {
    diagnosis: string;
    plan: string;
    notesPreview: string;
    chiefComplaint: string;
  };
  clinicalMemory: string[];
  clinicalMemoryConfidence: string | null;
  vitalsSummary: string | null;
  physicalExamSummary: string | null;
  longitudinalSummary: string | null;
  doctorDnaObservation: string | null;
  sources: CopilotContextSource[];
};

export type CopilotInsightKind =
  | "context"
  | "continuity"
  | "lab"
  | "medication"
  | "vitals";

export type CopilotInsight = {
  id: string;
  kind: CopilotInsightKind;
  title: string;
  body: string;
};

export type ClinicalRiskLevel = "bajo" | "moderado" | "alto";

export type ClinicalRiskSignal = {
  id: string;
  level: ClinicalRiskLevel;
  title: string;
  body: string;
};

export type DocumentationGap = {
  id: string;
  field: string;
  message: string;
};

export type DocumentationQualityLabel = "Excelente" | "Adecuado" | "Incompleto";

export type DocumentationQuality = {
  score: number;
  label: DocumentationQualityLabel;
  factors: Array<{ id: string; label: string; points: number; max: number }>;
};

export type ClinicalCopilotIntelligenceBundle = {
  context: CopilotContextView;
  insights: CopilotInsight[];
  riskSignals: ClinicalRiskSignal[];
  documentationGaps: DocumentationGap[];
  documentationQuality: DocumentationQuality;
  /** Phase 4.7B — sin insight, riesgo, gap ni alerta relevante */
  silenceMode: boolean;
};

export const COPILOT_SILENCE_MESSAGE =
  "Sin observaciones clínicas relevantes para esta consulta.";

export const COPILOT_RISK_EMPTY_MESSAGE =
  "No se detectan señales clínicas relevantes.";

export type BuildClinicalCopilotInput = {
  consultationId?: string | null;
  diagnosis?: string | null;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  chiefComplaint?: string | null;
  treatment?: string | null;
  notes?: string | null;
  patientName?: string | null;
  patientAge?: string | number | null;
  patientSex?: string | null;
  clinicalMemory?: ClinicalMemoryView | null;
  clinicalMemoryRaw?: PatientClinicalMemory | null;
  doctorDna?: DoctorDnaIntelligenceView | null;
};

function truncatePreview(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

function monthsSince(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  return (
    (now.getFullYear() - d.getFullYear()) * 12 +
    (now.getMonth() - d.getMonth())
  );
}

function extractCode(
  code?: string | null,
  diagnosis?: string | null,
): string | null {
  const c = code?.trim();
  if (c) return c.toUpperCase();
  const m = diagnosis?.trim().match(/^([A-Z]\d{2}(?:\.\d+)?)/i);
  return m?.[1]?.toUpperCase() ?? null;
}

function isHypertension(code: string | null): boolean {
  return code != null && /^I1[0-5]/i.test(code);
}

function isDiabetes(code: string | null): boolean {
  return code != null && /^E11/i.test(code);
}

function isAsthma(code: string | null): boolean {
  return code != null && /^J45/i.test(code);
}

function isCopd(code: string | null): boolean {
  return code != null && /^J44/i.test(code);
}

function isHypothyroidism(code: string | null): boolean {
  return code != null && /^E03/i.test(code);
}

function isObesity(code: string | null): boolean {
  return code != null && /^E66/i.test(code);
}

function isErge(code: string | null): boolean {
  return code != null && /^K21/i.test(code);
}

function isParkinson(code: string | null): boolean {
  return code != null && /^G20/i.test(code);
}

function isArthritis(code: string | null): boolean {
  return code != null && /^M19/i.test(code);
}

function isAtrialFibrillation(code: string | null): boolean {
  return code != null && /^I48/i.test(code);
}

function isElevatedBp(systolic?: number | null, diastolic?: number | null): boolean {
  return (systolic != null && systolic >= 140) || (diastolic != null && diastolic >= 90);
}

function getPriorConsultation(
  memory: PatientClinicalMemory | null | undefined,
  consultationId?: string | null,
) {
  return memory?.recentConsultations.find((c) => c.id !== consultationId) ?? null;
}

function monthsSinceLastConsult(
  memory: PatientClinicalMemory | null | undefined,
  consultationId?: string | null,
): number | null {
  const prior = getPriorConsultation(memory, consultationId);
  return prior ? monthsSince(prior.createdAt) : null;
}

function persistentMedications(
  memory: PatientClinicalMemory | null | undefined,
  pattern: RegExp,
  minMonths = 6,
) {
  return (
    memory?.currentMedications.filter((m) => {
      if (!pattern.test(m.name)) return false;
      const months = monthsSince(m.since);
      return months != null && months >= minMonths;
    }) ?? []
  );
}

function isPolymedicated(memory: PatientClinicalMemory | null | undefined): boolean {
  return (memory?.currentMedications.length ?? 0) >= 5;
}

function countActiveChronicConditions(
  memory: PatientClinicalMemory | null | undefined,
): number {
  return memory?.activeConditions.length ?? 0;
}

function pushFollowupGapInsight(
  insights: CopilotInsight[],
  opts: {
    id: string;
    title: string;
    memory: PatientClinicalMemory | null | undefined;
    consultationId?: string | null;
    minMonths?: number;
  },
) {
  const months = monthsSinceLastConsult(opts.memory, opts.consultationId);
  if (months != null && months >= (opts.minMonths ?? 3)) {
    insights.push({
      id: opts.id,
      kind: "continuity",
      title: opts.title,
      body: `Última consulta previa en memoria: hace ~${months} mes(es). Contexto de continuidad asistencial.`,
    });
  }
}

function pushTreatmentPersistenceInsight(
  insights: CopilotInsight[],
  opts: {
    id: string;
    title: string;
    memory: PatientClinicalMemory | null | undefined;
    pattern: RegExp;
    minMonths?: number;
  },
) {
  const meds = persistentMedications(
    opts.memory,
    opts.pattern,
    opts.minMonths ?? 6,
  );
  if (meds.length) {
    insights.push({
      id: opts.id,
      kind: "medication",
      title: opts.title,
      body: `${meds.map((m) => m.name).join(", ")} documentado ≥${opts.minMonths ?? 6} meses en memoria clínica.`,
    });
  }
}

export function buildCopilotContextV2(
  input: BuildClinicalCopilotInput,
): CopilotContextView {
  const diagnosis =
    input.diagnosisDescription?.trim() ||
    input.diagnosis?.trim() ||
    null;
  const code = extractCode(input.diagnosisCode, input.diagnosis);
  const plan = input.treatment?.trim() ?? "";
  const notesPreview = truncatePreview(input.notes ?? "");
  const chiefComplaint = input.chiefComplaint?.trim() ?? "";

  const memory = input.clinicalMemoryRaw;
  const foundation = buildClinicalDataFoundation({
    encounterNotes: input.notes,
    treatment: input.treatment,
    memory,
    currentConsultationId: input.consultationId,
  });

  const activeMedications =
    memory?.currentMedications
      .map((m) => m.name.trim())
      .filter(Boolean)
      .slice(0, 6) ?? [];

  const longitudinal = foundation.longitudinal;
  const recentTimeline = longitudinal.entries.map((e) => {
    const parts = [e.dateLabel];
    if (e.primaryDiagnosis) parts.push(e.primaryDiagnosis);
    return parts.join(" · ");
  });

  const pendingLabs =
    memory?.pendingLabs.map((l) => l.exam.trim()).filter(Boolean).slice(0, 6) ??
    [];

  const vitalsCtx = foundation.vitalSigns;
  const vitalsSummary = vitalsCtx.hasData
    ? [
        vitalsCtx.vitals.systolic != null && vitalsCtx.vitals.diastolic != null
          ? `PA ${vitalsCtx.vitals.systolic}/${vitalsCtx.vitals.diastolic} mmHg`
          : null,
        vitalsCtx.vitals.heartRate != null
          ? `FC ${vitalsCtx.vitals.heartRate} lpm`
          : null,
        vitalsCtx.vitals.oxygenSaturation != null
          ? `SatO2 ${vitalsCtx.vitals.oxygenSaturation}%`
          : null,
      ]
        .filter(Boolean)
        .join("; ") || null
    : null;

  const pe = foundation.physicalExam;
  const peSections = hasPhysicalExamData(pe)
    ? Object.entries(pe)
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .slice(0, 4)
        .join(" · ")
    : null;

  const longText = longitudinal.hasData
    ? recentTimeline.join(" | ")
    : null;

  const sources: CopilotContextSource[] = [];
  if (chiefComplaint || diagnosis || plan || notesPreview) sources.push("soap");
  if (input.clinicalMemory?.highlights.length) sources.push("clinical-memory");
  if (longitudinal.hasData) sources.push("longitudinal", "timeline");
  if (vitalsSummary) sources.push("vitals");
  if (peSections) sources.push("physical-exam");
  if (input.patientName || input.patientAge || input.patientSex) {
    sources.push("patient-snapshot");
  }
  if (input.doctorDna?.primaryInsight) sources.push("doctor-dna");
  if (pendingLabs.length) sources.push("orders");

  return {
    activeDiagnosis: diagnosis,
    activeDiagnosisCode: code,
    activeMedications,
    recentTimeline,
    pendingLabs,
    soapSummary: {
      diagnosis: diagnosis ?? "Sin diagnóstico estructurado",
      plan: plan || "Sin plan registrado",
      notesPreview: notesPreview || "Sin notas en esta sesión",
      chiefComplaint: chiefComplaint || "Sin motivo registrado",
    },
    clinicalMemory: input.clinicalMemory?.highlights ?? [],
    clinicalMemoryConfidence: input.clinicalMemory
      ? clinicalMemoryConfidenceLabel(input.clinicalMemory.confidence)
      : null,
    vitalsSummary,
    physicalExamSummary: peSections,
    longitudinalSummary: longText,
    doctorDnaObservation: input.doctorDna?.primaryInsight?.trim() || null,
    sources,
  };
}

export function buildClinicalInsightCards(
  input: BuildClinicalCopilotInput,
  context: CopilotContextView,
): CopilotInsight[] {
  const insights: CopilotInsight[] = [];
  const code = context.activeDiagnosisCode;
  const memory = input.clinicalMemoryRaw;
  const foundation = buildClinicalDataFoundation({
    encounterNotes: input.notes,
    treatment: input.treatment,
    memory,
    currentConsultationId: input.consultationId,
  });
  const vitals = foundation.vitalSigns.vitals;

  if (isHypertension(code)) {
    if (
      vitals.systolic != null &&
      vitals.diastolic != null &&
      isElevatedBp(vitals.systolic, vitals.diastolic)
    ) {
      insights.push({
        id: "hta-vitals",
        kind: "vitals",
        title: "Presión arterial elevada documentada",
        body: `En la documentación actual consta PA ${vitals.systolic}/${vitals.diastolic} mmHg. Observación contextual — verificar en punto de atención.`,
      });
    }
    const lastConsult = memory?.recentConsultations.find(
      (c) => c.id !== input.consultationId,
    );
    if (lastConsult) {
      const months = monthsSince(lastConsult.createdAt);
      if (months != null && months >= 3) {
        insights.push({
          id: "hta-gap-control",
          kind: "continuity",
          title: "Intervalo desde último control registrado",
          body: `La última consulta previa en memoria clínica data de hace aproximadamente ${months} mes(es). Contexto de continuidad asistencial.`,
        });
      }
    }
  }

  if (isDiabetes(code)) {
    const hba1cLab = memory?.pendingLabs.find((l) =>
      /hba1c|hemoglobina glicosilada/i.test(l.exam),
    );
    if (hba1cLab) {
      insights.push({
        id: "dm2-lab",
        kind: "lab",
        title: "HbA1c presente en contexto de laboratorio",
        body: `${hba1cLab.exam} — dato documentado en memoria clínica. No constituye interpretación clínica automática.`,
      });
    }
  }

  if (isAsthma(code)) {
    const exacerbationAlert = memory?.alerts.find((a) =>
      /exacerb|asma|crisis/i.test(a.message),
    );
    if (
      !exacerbationAlert &&
      memory?.activeConditions.some((c) => /asma/i.test(c.label))
    ) {
      insights.push({
        id: "asma-no-exacerbation",
        kind: "context",
        title: "Sin exacerbaciones documentadas recientemente",
        body: "No constan alertas activas de exacerbación asmática en memoria clínica.",
      });
    }

    const inhalers =
      memory?.currentMedications.filter((m) =>
        /salbutamol|budesonida|formoterol|inhal/i.test(m.name),
      ) ?? [];
    const persistent = inhalers.filter((m) => {
      const months = monthsSince(m.since);
      return months != null && months >= 6;
    });
    if (persistent.length) {
      insights.push({
        id: "asma-treatment-persistence",
        kind: "medication",
        title: "Tratamiento inhalatorio persistente",
        body: `${persistent.map((m) => m.name).join(", ")} documentado ≥6 meses en memoria clínica.`,
      });
    }

    const lastConsult = memory?.recentConsultations.find(
      (c) => c.id !== input.consultationId,
    );
    if (lastConsult) {
      const months = monthsSince(lastConsult.createdAt);
      if (months != null && months >= 3) {
        insights.push({
          id: "asma-followup-gap",
          kind: "continuity",
          title: "Intervalo desde último control asmático",
          body: `Última consulta previa en memoria: hace ~${months} mes(es). Contexto de continuidad asistencial.`,
        });
      }
    }
  }

  if (isCopd(code)) {
    pushTreatmentPersistenceInsight(insights, {
      id: "epoc-treatment-persistence",
      title: "Broncodilatador persistente documentado",
      memory,
      pattern: /tiotropio|salmeterol|formoterol|ipratropio|bronco|inhal/i,
    });
    pushFollowupGapInsight(insights, {
      id: "epoc-followup-gap",
      title: "Intervalo desde último control EPOC",
      memory,
      consultationId: input.consultationId,
    });
  }

  if (isHypothyroidism(code)) {
    const tshLab = memory?.pendingLabs.find((l) =>
      /tsh|tiroid/i.test(l.exam),
    );
    if (tshLab) {
      insights.push({
        id: "hypo-lab",
        kind: "lab",
        title: "TSH en contexto de laboratorio",
        body: `${tshLab.exam} — dato documentado en memoria clínica. No constituye interpretación clínica automática.`,
      });
    }
    pushTreatmentPersistenceInsight(insights, {
      id: "hypo-treatment-persistence",
      title: "Tratamiento tiroideo persistente",
      memory,
      pattern: /levotiroxina|eutirox|levothyroxine/i,
    });
    pushFollowupGapInsight(insights, {
      id: "hypo-followup-gap",
      title: "Intervalo desde último control tiroideo",
      memory,
      consultationId: input.consultationId,
    });
  }

  if (isObesity(code)) {
    const priorConsults =
      memory?.recentConsultations.filter((c) => c.id !== input.consultationId) ??
      [];
    if (priorConsults.length >= 2) {
      insights.push({
        id: "obesity-longitudinal",
        kind: "continuity",
        title: "Seguimiento longitudinal documentado",
        body: `${priorConsults.length} consulta(s) previa(s) en memoria clínica — contexto de continuidad en manejo de peso.`,
      });
    }
    pushFollowupGapInsight(insights, {
      id: "obesity-followup-gap",
      title: "Intervalo desde último control de peso",
      memory,
      consultationId: input.consultationId,
    });
  }

  if (isErge(code)) {
    pushTreatmentPersistenceInsight(insights, {
      id: "erge-treatment-persistence",
      title: "IBP persistente documentado",
      memory,
      pattern: /omeprazol|esomeprazol|lansoprazol|pantoprazol|rabeprazol/i,
    });
    pushFollowupGapInsight(insights, {
      id: "erge-followup-gap",
      title: "Intervalo desde último control ERGE",
      memory,
      consultationId: input.consultationId,
    });
  }

  if (isParkinson(code)) {
    pushTreatmentPersistenceInsight(insights, {
      id: "park-treatment-persistence",
      title: "Tratamiento neurológico persistente",
      memory,
      pattern: /levodopa|carbidopa|pramipexol|ropinirol|entacapona/i,
    });
    pushFollowupGapInsight(insights, {
      id: "park-followup-gap",
      title: "Intervalo desde último control neurológico",
      memory,
      consultationId: input.consultationId,
    });
  }

  if (isArthritis(code)) {
    pushFollowupGapInsight(insights, {
      id: "art-followup-gap",
      title: "Intervalo desde último control articular",
      memory,
      consultationId: input.consultationId,
    });
    const priorConsults =
      memory?.recentConsultations.filter((c) => c.id !== input.consultationId) ??
      [];
    if (priorConsults.length >= 2) {
      insights.push({
        id: "art-longitudinal",
        kind: "continuity",
        title: "Manejo crónico con consultas previas",
        body: `${priorConsults.length} consulta(s) previa(s) documentadas — continuidad en manejo articular.`,
      });
    }
  }

  if (isAtrialFibrillation(code)) {
    pushTreatmentPersistenceInsight(insights, {
      id: "fa-treatment-persistence",
      title: "Anticoagulación persistente documentada",
      memory,
      pattern: /apixabán|rivaroxabán|warfarina|acenocumarol|dabigatrán|edoxabán/i,
    });
    pushFollowupGapInsight(insights, {
      id: "fa-followup-gap",
      title: "Intervalo desde último control cardiovascular",
      memory,
      consultationId: input.consultationId,
    });
  }

  if (isPolymedicated(memory)) {
    insights.push({
      id: "polypharmacy-context",
      kind: "context",
      title: "Polifarmacia documentada",
      body: `${memory!.currentMedications.length} medicamentos activos en memoria clínica. Observación contextual documental.`,
    });
  }

  const chronicCount = countActiveChronicConditions(memory);
  if (chronicCount >= 3 && foundation.longitudinal.hasData) {
    insights.push({
      id: "multimorbidity-context",
      kind: "context",
      title: "Multimorbilidad con seguimiento longitudinal",
      body: `${chronicCount} condiciones crónicas activas documentadas con continuidad asistencial en memoria clínica.`,
    });
  }

  return insights.slice(0, 8);
}

export function buildClinicalRiskSignals(
  input: BuildClinicalCopilotInput,
  context: CopilotContextView,
  insights: CopilotInsight[] = [],
): ClinicalRiskSignal[] {
  const signals: ClinicalRiskSignal[] = [];
  const code = context.activeDiagnosisCode;
  const memory = input.clinicalMemoryRaw;
  const vitals = parseClinicalVitalSignsFromNotes(
    input.notes,
    input.treatment,
  ).vitals;

  const hasHtaVitalsInsight = insights.some((i) => i.id === "hta-vitals");

  if (isElevatedBp(vitals.systolic, vitals.diastolic)) {
    const level =
      vitals.systolic != null && vitals.systolic >= 160 ? "alto" : "moderado";
    signals.push({
      id: "risk-elevated-bp",
      level,
      title: "Nivel de riesgo — presión arterial elevada",
      body: hasHtaVitalsInsight
        ? `Clasificación determinística: ${level}. Valores documentados en Clinical Insight™.`
        : `PA ${vitals.systolic}/${vitals.diastolic} mmHg — clasificación: ${level}.`,
    });
  }

  for (const alert of memory?.alerts.filter(
    (a) => a.severity === "critical" || a.severity === "warning",
  ) ?? []) {
    signals.push({
      id: `risk-alert-${alert.code}`,
      level: alert.severity === "critical" ? "alto" : "moderado",
      title: "Alerta clínica activa",
      body: alert.message,
    });
  }

  const pendingLabs = memory?.pendingLabs.filter(
    (l) => l.status === "pending" || /pendiente/i.test(l.status),
  );
  if (pendingLabs?.length) {
    signals.push({
      id: "risk-pending-labs",
      level: pendingLabs.length >= 2 ? "moderado" : "bajo",
      title: "Laboratorios pendientes",
      body: pendingLabs.map((l) => l.exam).slice(0, 3).join("; "),
    });
  }

  const lastConsult = memory?.recentConsultations.find(
    (c) => c.id !== input.consultationId,
  );
  if (lastConsult && (isHypertension(code) || isDiabetes(code) || isAsthma(code))) {
    const months = monthsSince(lastConsult.createdAt);
    if (months != null && months >= 4) {
      signals.push({
        id: "risk-overdue-followup",
        level: months >= 6 ? "moderado" : "bajo",
        title: "Control ambulatorio no registrado recientemente",
        body: `Última consulta en memoria: hace ~${months} mes(es).`,
      });
    }
  }

  return signals.slice(0, 6);
}

export function buildDocumentationGaps(
  input: BuildClinicalCopilotInput,
  context: CopilotContextView,
): DocumentationGap[] {
  const gaps: DocumentationGap[] = [];
  const code = context.activeDiagnosisCode;
  const notes = input.notes ?? "";
  const vitals = parseClinicalVitalSignsFromNotes(notes, input.treatment);
  const pe = resolvePhysicalExamFromNotes(notes);
  const treatment = input.treatment?.trim() ?? "";

  if (isHypertension(code) && !vitals.hasData) {
    gaps.push({
      id: "gap-pa",
      field: "Signos vitales",
      message: "No hay presión arterial documentada en la consulta actual.",
    });
  }

  if (isHypertension(code) && !pe.cardiovascular?.trim()) {
    gaps.push({
      id: "gap-pe-cv",
      field: "Examen cardiovascular",
      message: "No consta examen cardiovascular estructurado en la documentación.",
    });
  }

  if (isDiabetes(code) && vitals.vitals.weightKg == null) {
    gaps.push({
      id: "gap-weight",
      field: "Peso",
      message: "No hay peso registrado — útil para seguimiento metabólico.",
    });
  }

  if (!input.chiefComplaint?.trim()) {
    gaps.push({
      id: "gap-motivo",
      field: "Motivo de consulta",
      message: "Motivo de consulta no documentado.",
    });
  }

  if ((isHypertension(code) || isDiabetes(code) || isAsthma(code)) && !treatment) {
    gaps.push({
      id: "gap-plan",
      field: "Plan de seguimiento",
      message: "No hay plan terapéutico o seguimiento documentado.",
    });
  } else if (
    treatment &&
    !/seguim|control|revis|semana|mes/i.test(treatment) &&
    (isHypertension(code) || isDiabetes(code))
  ) {
    gaps.push({
      id: "gap-followup-text",
      field: "Seguimiento",
      message: "El plan no menciona plazo de control o seguimiento.",
    });
  }

  if (!notes.trim() || notes.trim().length < 20) {
    gaps.push({
      id: "gap-notes",
      field: "Anamnesis",
      message: "Notas clínicas breves o ausentes.",
    });
  }

  return gaps.slice(0, 6);
}

export function buildDocumentationQuality(
  input: BuildClinicalCopilotInput,
  context: CopilotContextView,
): DocumentationQuality {
  const factors: DocumentationQuality["factors"] = [];
  let score = 0;

  const add = (id: string, label: string, points: number, max: number, ok: boolean) => {
    const earned = ok ? points : 0;
    score += earned;
    factors.push({ id, label, points: earned, max });
  };

  add(
    "dx",
    "Diagnóstico documentado",
    20,
    20,
    Boolean(context.activeDiagnosis),
  );
  add(
    "motivo",
    "Motivo de consulta",
    10,
    10,
    Boolean(input.chiefComplaint?.trim()),
  );
  add(
    "anamnesis",
    "Anamnesis / notas",
    15,
    15,
    (input.notes?.trim().length ?? 0) >= 30,
  );
  add(
    "vitals",
    "Signos vitales",
    15,
    15,
    parseClinicalVitalSignsFromNotes(input.notes, input.treatment).hasData,
  );
  add(
    "pe",
    "Examen físico",
    15,
    15,
    hasPhysicalExamData(resolvePhysicalExamFromNotes(input.notes ?? "")),
  );
  add(
    "plan",
    "Conducta / tratamiento",
    15,
    15,
    Boolean(input.treatment?.trim()),
  );
  add(
    "followup",
    "Seguimiento documentado",
    10,
    10,
    /seguim|control|revis|semana|mes/i.test(input.treatment ?? ""),
  );

  let label: DocumentationQualityLabel = "Incompleto";
  if (score >= 85) label = "Excelente";
  else if (score >= 60) label = "Adecuado";

  return { score, label, factors };
}

export function buildClinicalCopilotIntelligence(
  input: BuildClinicalCopilotInput,
): ClinicalCopilotIntelligenceBundle {
  const context = buildCopilotContextV2(input);
  const insights = buildClinicalInsightCards(input, context);
  const riskSignals = buildClinicalRiskSignals(input, context, insights);
  const documentationGaps = buildDocumentationGaps(input, context);
  const documentationQuality = buildDocumentationQuality(input, context);

  const silenceMode =
    insights.length === 0 &&
    riskSignals.length === 0 &&
    documentationGaps.length === 0;

  return {
    context,
    insights,
    riskSignals,
    documentationGaps,
    documentationQuality,
    silenceMode,
  };
}

export function getCopilotInsightIcon(kind: CopilotInsightKind): string {
  switch (kind) {
    case "context":
      return "📋";
    case "continuity":
      return "📆";
    case "lab":
      return "🧪";
    case "medication":
      return "💊";
    case "vitals":
      return "🫀";
  }
}

export function getRiskLevelStyles(level: ClinicalRiskLevel): {
  border: string;
  bg: string;
  text: string;
  badge: string;
} {
  switch (level) {
    case "alto":
      return {
        border: "border-red-200",
        bg: "bg-red-50/60",
        text: "text-red-900",
        badge: "bg-red-100 text-red-800",
      };
    case "moderado":
      return {
        border: "border-amber-200",
        bg: "bg-amber-50/60",
        text: "text-amber-900",
        badge: "bg-amber-100 text-amber-800",
      };
    case "bajo":
      return {
        border: "border-emerald-200",
        bg: "bg-emerald-50/40",
        text: "text-emerald-900",
        badge: "bg-emerald-100 text-emerald-800",
      };
  }
}

export function getQualityLabelStyles(label: DocumentationQualityLabel): string {
  switch (label) {
    case "Excelente":
      return "bg-emerald-100 text-emerald-800";
    case "Adecuado":
      return "bg-sky-100 text-sky-800";
    case "Incompleto":
      return "bg-slate-100 text-slate-700";
  }
}

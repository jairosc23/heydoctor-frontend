import {
  buildClinicalDataFoundation,
  formatClinicalDataFoundationPrompt,
} from "./clinical-data-foundation";
import { buildClinicalMemoryView } from "./clinical-memory";
import { formatPhysicalExamForSoap } from "./physical-exam-framework";
import type { PatientClinicalMemory } from "./types/clinical-memory";

export type ClinicalAiDiagnosis = {
  code: string;
  description: string;
};

export type ClinicalAiContextInput = {
  patientDemographics?: string | null;
  activeDiagnosis?: ClinicalAiDiagnosis | null;
  chiefComplaint?: string | null;
  draftNotes?: string | null;
  treatment?: string | null;
  diagnosisText?: string | null;
  memory?: PatientClinicalMemory | null;
  allergyLines?: string[];
  encounterDiagnosis?: string | null;
  /** Consulta activa — excluye del resumen longitudinal. */
  currentConsultationId?: string | null;
  /** Notas del encuentro (incluye marcadores HD_VS / HD_PE / HD_CR). */
  encounterNotes?: string | null;
};

function uniqueLabels(items: Array<{ label: string }>, limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const label = item.label?.trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= limit) break;
  }
  return out;
}

/** Phase 4.5 — bloque de contexto clínico para prompts de asistencia IA. */
export function buildClinicalAiContextPrompt(
  input: ClinicalAiContextInput,
): string {
  const lines: string[] = [];

  if (input.patientDemographics?.trim()) {
    lines.push(`Paciente ${input.patientDemographics.trim()}.`);
  }

  const dx = input.activeDiagnosis;
  if (dx?.code || dx?.description) {
    lines.push(
      `Diagnóstico activo: ${[dx.code, dx.description].filter(Boolean).join(" ")}.`,
    );
  } else if (input.diagnosisText?.trim()) {
    lines.push(`Diagnóstico activo: ${input.diagnosisText.trim()}.`);
  }

  if (input.memory) {
    const memoryView = buildClinicalMemoryView({
      memory: input.memory,
      encounterDiagnosis: input.encounterDiagnosis,
    });
    const conditions = uniqueLabels(
      [
        ...input.memory.activeConditions,
        ...input.memory.recentDiagnoses,
      ],
      5,
    );
    if (conditions.length > 0) {
      lines.push("Antecedentes:");
      for (const label of conditions) lines.push(`- ${label}`);
    }

    const meds = input.memory.currentMedications
      .map((m) => m.name.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (meds.length > 0) {
      lines.push("Tratamiento actual:");
      for (const name of meds) lines.push(`- ${name}`);
    }

    const labs = input.memory.pendingLabs
      .map((l) => l.exam.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (labs.length > 0) {
      lines.push("Últimos laboratorios / pendientes:");
      for (const exam of labs) lines.push(`- ${exam}`);
    }

    const criticalAlerts = input.memory.alerts
      .filter((a) => a.severity === "critical" || a.severity === "warning")
      .map((a) => a.message.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (criticalAlerts.length > 0) {
      lines.push("Alertas clínicas:");
      for (const msg of criticalAlerts) lines.push(`- ${msg}`);
    }

    const highlight = memoryView.highlights
      .filter((h) => !/riesgo crítico no identificado/i.test(h))
      .slice(0, 2);
    if (highlight.length > 0) {
      lines.push("Memoria clínica relevante:");
      for (const h of highlight) lines.push(`- ${h}`);
    }
  }

  if (input.allergyLines?.length) {
    lines.push("Alergias:");
    for (const allergy of input.allergyLines.slice(0, 5)) {
      lines.push(`- ${allergy}`);
    }
  }

  if (input.chiefComplaint?.trim()) {
    lines.push(`Motivo actual: ${input.chiefComplaint.trim()}.`);
  }

  if (input.treatment?.trim()) {
    lines.push(`Tratamiento / plan documentado: ${input.treatment.trim()}.`);
  }

  const foundation = buildClinicalDataFoundation({
    encounterNotes: input.encounterNotes ?? input.draftNotes,
    treatment: input.treatment,
    memory: input.memory,
    currentConsultationId: input.currentConsultationId,
  });
  const foundationBlock = formatClinicalDataFoundationPrompt(foundation);
  if (foundationBlock) {
    lines.push(foundationBlock);
  }

  lines.push(
    "",
    "Instrucción: generar evolución clínica profesional, estructurada y sin inventar hallazgos no documentados.",
  );

  return lines.join("\n");
}

export function formatPatientDemographics(input: {
  age?: string | number | null;
  sex?: string | null;
}): string | null {
  const age =
    input.age != null && String(input.age).trim() && String(input.age) !== "—"
      ? `${String(input.age).trim()} años`
      : null;
  const sex = input.sex?.trim() || null;
  if (age && sex) return `${sex}, ${age}`;
  return age || sex;
}

/** Examen físico documentado para SOAP — vacío si no hay datos. */
export function resolvePhysicalExamTextFromInput(
  input: Pick<ClinicalAiContextInput, "encounterNotes" | "draftNotes">,
): string {
  const foundation = buildClinicalDataFoundation({
    encounterNotes: input.encounterNotes ?? input.draftNotes,
  });
  return formatPhysicalExamForSoap(foundation.physicalExam);
}

export function hashClinicalText(
  consultationId: string,
  ...parts: Array<string | null | undefined>
): string {
  const payload = [consultationId, ...parts.map((p) => p?.trim() ?? "")].join(
    "|",
  );
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return `${consultationId}:${Math.abs(hash)}`;
}

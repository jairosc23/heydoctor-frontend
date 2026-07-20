/**
 * EPIC-3 UC-03C — Real-Time Clinical Insights (generative via AiService).
 *
 * Reuses POST /ai/consultation-assist (AiService + AI Governance).
 * Insights are Copilot suggestions only — session-local, never EMR.
 * Forbidden outputs: diagnoses, treatments, Rx, orders, referrals, SOAP, summary.
 */

import type { ConsultationAssistRequest } from "@/lib/services/consultation-assist";
import type { NestConsultation } from "@/lib/services/consultations";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import type { LiveDocumentationQualityView } from "./live-documentation-quality";
import { labelDocQualityStatus } from "./live-documentation-quality";

export type LiveClinicalInsight = {
  id: string;
  text: string;
  origin: "copilot";
  discarded?: boolean;
  aiRunId: string | null;
  promptVersion: string | null;
};

export type LiveClinicalInsightsBatch = {
  sessionId: string | null;
  aiRunId: string | null;
  promptVersion: string | null;
  assistiveOnlyNotice: string | null;
  insights: LiveClinicalInsight[];
  generatedAt: string;
  readOnlyEmr: true;
  persistsToEmr: false;
};

const LIVE_INSIGHTS_MODE_NOTES = [
  "Modo Real-Time Clinical Insights (EPIC-3 UC-03C) durante la consulta.",
  "En el arreglo recommendations escribe 4 a 8 INSIGHTS en español para el médico.",
  "Solo se permiten: (1) temas para profundizar en anamnesis,",
  "(2) inconsistencias entre datos ya documentados,",
  "(3) datos clínicos potencialmente faltantes,",
  "(4) recordatorios contextuales ligados al motivo y Foundation.",
  "PROHIBIDO en recommendations: diagnósticos, tratamientos, recetas, órdenes,",
  "derivaciones, SOAP, summary clínico o planes terapéuticos.",
  "possibleDiagnoses debe quedar vacío []. generalEducation vacío [].",
  "Cada insight = una frase corta sugerida; no es una acción automática.",
].join(" ");

function docQualityBlock(quality: LiveDocumentationQualityView | null): string {
  if (!quality) return "Documentation quality: no evaluada.";
  return [
    "Documentation Quality Assistant:",
    ...quality.indicators.map(
      (i) =>
        `- ${i.label}: ${labelDocQualityStatus(i.status)} (${i.observation})`,
    ),
  ].join("\n");
}

function consultationBlock(consultation: NestConsultation | null): string {
  if (!consultation) return "Consultation: no cargada.";
  return [
    `Status: ${consultation.status ?? "(n/d)"}`,
    `Motivo: ${consultation.chiefComplaint ?? consultation.reason ?? "(vacío)"}`,
    `Diagnóstico doc: ${consultation.diagnosis ?? "(vacío)"}`,
    `Plan doc: ${consultation.treatmentPlan ?? consultation.treatment ?? "(vacío)"}`,
    `Notas: ${consultation.notes ? "presentes" : "ausentes"}`,
    `Consentimiento: ${consultation.consentGivenAt ? "presente" : "ausente"}`,
    `Firma: ${consultation.signedAt ? "presente" : "ausente"}`,
  ].join("\n");
}

function foundationBlock(foundation: ClinicalFoundationBundle | null): string {
  if (!foundation) return "Clinical Foundation: no cargado.";
  const conditions = (foundation.memory?.activeConditions ?? [])
    .map((c) => c.label)
    .slice(0, 8);
  const meds = (foundation.memory?.currentMedications ?? [])
    .map((m) => m.name)
    .slice(0, 8);
  return [
    `Paciente: ${foundation.patient.displayName}`,
    `Estado: ${foundation.consultation.status}`,
    `Motivo: ${foundation.consultation.reason ?? "(vacío)"}`,
    `Chief: ${foundation.encounter.chiefComplaint ?? "(vacío)"}`,
    `SOAP S: ${foundation.encounter.subjective ? "sí" : "no"}`,
    `SOAP O: ${foundation.encounter.objective ? "sí" : "no"}`,
    `Vitales: ${foundation.encounter.vitalSigns ? "sí" : "no"}`,
    `Examen físico: ${foundation.encounter.physicalExam ? "sí" : "no"}`,
    `Antecedentes: ${conditions.length ? conditions.join("; ") : "(ninguno)"}`,
    `Medicamentos: ${meds.length ? meds.join("; ") : "(ninguno)"}`,
  ].join("\n");
}

/** Build AiService consultation-assist payload for live insights. */
export function buildLiveInsightsAssistRequest(input: {
  consultation: NestConsultation | null;
  foundation: ClinicalFoundationBundle | null;
  documentationQuality: LiveDocumentationQualityView | null;
}): ConsultationAssistRequest {
  const chiefComplaint =
    input.foundation?.consultation.reason?.trim() ||
    input.foundation?.encounter.chiefComplaint?.trim() ||
    input.consultation?.chiefComplaint?.trim() ||
    input.consultation?.reason?.trim() ||
    undefined;

  const symptoms = [
    docQualityBlock(input.documentationQuality),
    "Consultation:",
    consultationBlock(input.consultation),
  ].join("\n");

  const notes = [LIVE_INSIGHTS_MODE_NOTES, foundationBlock(input.foundation)].join(
    "\n\n",
  );

  return {
    chiefComplaint: chiefComplaint?.slice(0, 2000),
    symptoms: symptoms.slice(0, 8000),
    notes: notes.slice(0, 12000),
  };
}

function newInsightId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `li-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Soft filter: drop lines that clearly look like forbidden clinical actions. */
export function isForbiddenInsightLine(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  const forbidden = [
    "diagnosticar",
    "diagnóstico definitivo",
    "prescribir",
    "recetar",
    "indicar tratamiento",
    "ordenar laboratorio",
    "solicitar interconsulta",
    "derivar a",
    "soap:",
    "resumen clínico:",
    "summary:",
  ];
  return forbidden.some((token) => t.includes(token));
}

export function mapAssistToLiveClinicalInsights(input: {
  sessionId: string | null;
  aiRunId?: string | null;
  promptVersion?: string | null;
  assistiveOnlyNotice?: string | null;
  recommendations?: string[] | null;
  generatedAt?: string;
}): LiveClinicalInsightsBatch {
  const aiRunId = input.aiRunId ?? null;
  const promptVersion = input.promptVersion ?? null;
  const insights = (input.recommendations ?? [])
    .map((line) => line.trim())
    .filter((text) => text.length > 0 && !isForbiddenInsightLine(text))
    .slice(0, 8)
    .map(
      (text): LiveClinicalInsight => ({
        id: newInsightId(),
        text,
        origin: "copilot",
        aiRunId,
        promptVersion,
      }),
    );

  return {
    sessionId: input.sessionId,
    aiRunId,
    promptVersion,
    assistiveOnlyNotice: input.assistiveOnlyNotice ?? null,
    insights,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    readOnlyEmr: true,
    persistsToEmr: false,
  };
}

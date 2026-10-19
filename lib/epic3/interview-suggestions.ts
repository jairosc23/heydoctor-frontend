/**
 * EPIC-3 UC-02B — Suggested Interview Questions (generative via AiService).
 *
 * Reuses POST /ai/consultation-assist (AiService + AI Governance).
 * Maps assistive recommendations into editable session-local suggestions.
 * No EMR writes, no SOAP/summary/orders/persistence.
 */

import type { ConsultationAssistRequest } from "@/lib/services/consultation-assist";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import type { PreVisitContextView } from "./pre-visit-context";
import type { PreVisitQualitySignalsView } from "./pre-visit-quality-signals";
import { labelQualitySignalStatus } from "./pre-visit-quality-signals";

export type InterviewSuggestion = {
  id: string;
  text: string;
  /** Always Copilot proposal until physician edits (still marked as Copilot origin). */
  origin: "copilot";
  edited: boolean;
  aiRunId: string | null;
  promptVersion: string | null;
};

export type InterviewSuggestionsBatch = {
  sessionId: string | null;
  aiRunId: string | null;
  promptVersion: string | null;
  assistiveOnlyNotice: string | null;
  suggestions: InterviewSuggestion[];
  generatedAt: string;
  readOnlyEmr: true;
  persistsToEmr: false;
};

const INTERVIEW_MODE_NOTES = [
  "Modo entrevista pre-visita (EPIC-3 UC-02B).",
  "En el arreglo recommendations escribe 4 a 8 PREGUNTAS concretas en español",
  "que el médico pueda hacer al paciente en la anamnesis inicial.",
  "Cada ítem de recommendations debe ser una sola pregunta (idealmente con ¿ ?).",
  "No propongas órdenes, recetas, derivaciones, SOAP ni diagnósticos definitivos en recommendations.",
  "possibleDiagnoses puede quedar breve o vacío; generalEducation vacío preferible.",
].join(" ");

function qualitySignalsBlock(signals: PreVisitQualitySignalsView | null): string {
  if (!signals) return "Quality signals: no evaluados.";
  return [
    "Pre-Visit Quality Signals:",
    ...signals.signals.map(
      (s) =>
        `- ${s.label}: ${labelQualitySignalStatus(s.status)} (${s.observation})`,
    ),
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
    `Estado encounter: ${foundation.consultation.status}`,
    `Motivo foundation: ${foundation.consultation.reason ?? "(vacío)"}`,
    `Chief complaint: ${foundation.encounter.chiefComplaint ?? "(vacío)"}`,
    `Antecedentes observados: ${conditions.length ? conditions.join("; ") : "(ninguno)"}`,
    `Medicamentos observados: ${meds.length ? meds.join("; ") : "(ninguno)"}`,
  ].join("\n");
}

/** Build AiService consultation-assist payload from Prep context. */
export function buildInterviewAssistRequest(input: {
  preVisit: PreVisitContextView;
  qualitySignals: PreVisitQualitySignalsView | null;
  foundation: ClinicalFoundationBundle | null;
}): ConsultationAssistRequest {
  const chiefComplaint =
    input.preVisit.motivoSource === "unavailable"
      ? undefined
      : input.preVisit.motivo;

  const symptoms = [
    qualitySignalsBlock(input.qualitySignals),
    `Motivo (Pre-Visit Context): ${input.preVisit.motivo}`,
    `Fuente motivo: ${input.preVisit.motivoSource}`,
  ].join("\n");

  const notes = [INTERVIEW_MODE_NOTES, foundationBlock(input.foundation)].join(
    "\n\n",
  );

  return {
    chiefComplaint: chiefComplaint?.slice(0, 2000),
    symptoms: symptoms.slice(0, 8000),
    notes: notes.slice(0, 12000),
  };
}

function newSuggestionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `iq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeQuestionText(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  if (text.includes("¿") || text.endsWith("?")) return text;
  return text;
}

/**
 * Map AiService assist result → interview suggestions.
 * Prefers recommendations; does not invent clinical content beyond model output.
 */
export function mapAssistToInterviewSuggestions(input: {
  sessionId: string | null;
  aiRunId?: string | null;
  promptVersion?: string | null;
  assistiveOnlyNotice?: string | null;
  recommendations?: string[] | null;
  generatedAt?: string;
}): InterviewSuggestionsBatch {
  const aiRunId = input.aiRunId ?? null;
  const promptVersion = input.promptVersion ?? null;
  const suggestions = (input.recommendations ?? [])
    .map((line) => normalizeQuestionText(line))
    .filter((text) => text.length > 0)
    .slice(0, 8)
    .map(
      (text): InterviewSuggestion => ({
        id: newSuggestionId(),
        text,
        origin: "copilot",
        edited: false,
        aiRunId,
        promptVersion,
      }),
    );

  return {
    sessionId: input.sessionId,
    aiRunId,
    promptVersion,
    assistiveOnlyNotice: input.assistiveOnlyNotice ?? null,
    suggestions,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    readOnlyEmr: true,
    persistsToEmr: false,
  };
}

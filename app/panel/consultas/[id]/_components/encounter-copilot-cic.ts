import { ENCOUNTER_CIC_ID } from "./clinical-navigation-rail-model";

/**
 * E6 CIC + context-aware + continuous local guidance.
 * Observes Encounter evolution in-process. Never fetches on open.
 * Proposes only. Never confirms, emits, persists, or writes SOAP by itself.
 */

export { ENCOUNTER_CIC_ID };

export const CIC_MAX_VISIBLE_PROPOSALS = 3;

export const CIC_AUTHORITY = {
  propose: true,
  decide: false,
  confirm: false,
  emit: false,
  persist: false,
} as const;

export const CIC_ASSIST_MODES = [
  "structure_soap",
  "continue_soap",
  "clinical_summary",
  "reasoning_questions",
  "offer_suggestions",
] as const;

export type CicAssistMode = (typeof CIC_ASSIST_MODES)[number];

export type CicSoapProgress = "empty" | "partial" | "complete";

export const CIC_ASSIST_MODE_LABELS: Record<CicAssistMode, string> = {
  structure_soap: "Estructurar SOAP",
  continue_soap: "Continuar SOAP",
  clinical_summary: "Resumen clínico",
  reasoning_questions: "Preguntas de razonamiento",
  offer_suggestions: "Sugerencias de oferta",
};

/** Discrete one-line guidance. Not a toast, modal, or interrupt. */
export const CIC_ASSIST_MODE_HINTS: Record<CicAssistMode, string> = {
  structure_soap: "SOAP vacío. Propone cómo empezar. No decide.",
  continue_soap: "SOAP en curso. Propone qué falta documentar.",
  clinical_summary: "SOAP completo. Propone un resumen para que usted edite.",
  reasoning_questions: "Hay un problema activo nuevo. Propone preguntas, no el diagnóstico.",
  offer_suggestions: "Oferta abierta. Comprobaciones clínicas. No confirma ni emite.",
};

export type CicProposalTarget = "soap_subjective" | "soap_plan";

export type CicProposal = {
  id: string;
  text: string;
  target: CicProposalTarget;
};

export type CicEncounterContext = {
  chiefComplaint: string;
  subjective: string;
  plan: string;
  physicalExamDocumented: boolean;
  antecedentsDocumented: boolean;
  activeProblemCount: number;
  /** Null on first observation: pre-existing problems are not an "appearance". */
  previousActiveProblemCount?: number | null;
  offerExpanded: boolean;
};

const SOAP_EMPTY_MAX_CHARS = 12;
const SOAP_ADVANCED_MIN_CHARS = 120;

/** Collapsed encounter open must not spend the E4 budget on Copilot assist. */
export function cicAssistFetchesOnEncounterOpen(): 0 {
  return 0;
}

export function capCicProposals(
  proposals: readonly CicProposal[],
): CicProposal[] {
  return proposals.slice(0, CIC_MAX_VISIBLE_PROPOSALS);
}

export function applyCicProposalToSoap(
  current: string,
  proposal: string,
): string {
  const text = proposal.trim();
  if (!text) return current;
  const base = current.trimEnd();
  if (!base) return text;
  if (base.includes(text)) return current;
  return `${base}\n${text}`;
}

export function isCicForbiddenAction(action: string): boolean {
  const normalized = action.trim().toLowerCase();
  return (
    normalized === "confirm" ||
    normalized === "emit" ||
    normalized === "firmar" ||
    normalized === "hab" ||
    normalized === "decidir" ||
    normalized === "persist"
  );
}

export function cicAllowedActions(): readonly [
  "apply_soap",
  "apply_plan",
  "dismiss",
  "suggest",
] {
  return ["apply_soap", "apply_plan", "dismiss", "suggest"];
}

export function isCicSoapEmpty(context: CicEncounterContext): boolean {
  return (
    context.subjective.trim().length < SOAP_EMPTY_MAX_CHARS &&
    context.plan.trim().length < SOAP_EMPTY_MAX_CHARS &&
    !context.physicalExamDocumented
  );
}

export function isCicSoapComplete(context: CicEncounterContext): boolean {
  const documented =
    context.subjective.trim().length + context.plan.trim().length;
  if (documented < SOAP_ADVANCED_MIN_CHARS) return false;
  return (
    context.plan.trim().length >= 20 ||
    context.physicalExamDocumented ||
    context.subjective.trim().length >= 80
  );
}

/** @deprecated Use isCicSoapComplete. Kept so E6 callers stay valid. */
export function isCicSoapAdvanced(context: CicEncounterContext): boolean {
  return isCicSoapComplete(context);
}

export function classifyCicSoapProgress(
  context: CicEncounterContext,
): CicSoapProgress {
  if (isCicSoapEmpty(context)) return "empty";
  if (isCicSoapComplete(context)) return "complete";
  return "partial";
}

export function didActiveProblemsIncrease(
  context: CicEncounterContext,
): boolean {
  if (
    context.previousActiveProblemCount === null ||
    context.previousActiveProblemCount === undefined
  ) {
    return false;
  }
  return context.activeProblemCount > context.previousActiveProblemCount;
}

/**
 * Local, synchronous. Offer-in-view wins; closing the offer returns to the
 * best clinical mode. New active problems are an appearance, not a baseline.
 */
export function resolveCicAssistMode(
  context: CicEncounterContext,
): CicAssistMode {
  if (context.offerExpanded) return "offer_suggestions";
  const progress = classifyCicSoapProgress(context);
  if (progress === "empty") return "structure_soap";
  if (didActiveProblemsIncrease(context)) return "reasoning_questions";
  if (progress === "complete") return "clinical_summary";
  return "continue_soap";
}

/** Pure walk of evolving context. No I/O. */
export function resolveCicAssistModeSequence(
  frames: readonly CicEncounterContext[],
): CicAssistMode[] {
  return frames.map((frame) => resolveCicAssistMode(frame));
}

export function cicProposalTargetForMode(
  mode: CicAssistMode,
): CicProposalTarget {
  if (mode === "offer_suggestions" || mode === "clinical_summary") {
    return "soap_plan";
  }
  return "soap_subjective";
}

export function isForbiddenCicProposal(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  const blocked = [
    "prescribir",
    "recetar",
    "emitir receta",
    "confirmar orden",
    "confirmar receta",
    "diagnosticar",
    "diagnóstico definitivo",
    "firmar",
    "indicar tratamiento",
    "ordenar laboratorio",
    "solicitar interconsulta",
  ];
  return blocked.some((token) => t.includes(token));
}

const MODE_INSTRUCTIONS: Record<CicAssistMode, string> = {
  structure_soap:
    "Prioriza ayuda para estructurar SOAP: qué preguntar y qué documentar. Frases cortas.",
  continue_soap:
    "El SOAP está parcial. Prioriza qué falta (objetivo, tiempo, agravantes) sin repetir lo ya escrito.",
  clinical_summary:
    "Prioriza un resumen clínico breve de lo YA documentado, para que el médico lo edite. No inventes hallazgos.",
  reasoning_questions:
    "Prioriza preguntas de razonamiento ligadas a problemas activos nuevos. No des el diagnóstico.",
  offer_suggestions:
    "Prioriza comprobaciones clínicas ligadas a la oferta (alergias, adherencia, labs pendientes). No prescribas, no confirmes órdenes, no emitas.",
};

export function buildCicAssistNotes(
  mode: CicAssistMode,
  context: CicEncounterContext,
): string {
  const problems =
    context.activeProblemCount > 0
      ? `Problemas activos: ${context.activeProblemCount}`
      : "Problemas activos: (ninguno)";
  return [
    "Modo CIC del encuentro: propone. No diagnostiques, no recetes, no confirmes HAB, no emitas, no persistas.",
    MODE_INSTRUCTIONS[mode],
    `Motivo: ${context.chiefComplaint.trim() || "(vacío)"}`,
    context.subjective.trim()
      ? `SOAP S:\n${context.subjective.trim()}`
      : "SOAP S: (vacío)",
    context.plan.trim() ? `Plan:\n${context.plan.trim()}` : "Plan: (vacío)",
    context.physicalExamDocumented
      ? "Examen físico: documentado"
      : "Examen físico: (vacío)",
    context.antecedentsDocumented
      ? "Antecedentes: documentados"
      : "Antecedentes: (vacío)",
    problems,
    context.offerExpanded ? "Oferta clínica: abierta" : "Oferta clínica: cerrada",
    "possibleDiagnoses debe quedar vacío [].",
  ].join("\n\n");
}

export function isPhysicalExamDocumented(exam: {
  [key: string]: unknown;
  msk?: Record<string, string>;
}): boolean {
  for (const [key, value] of Object.entries(exam)) {
    if (key === "msk") continue;
    if (typeof value === "string" && value.trim()) return true;
  }
  return Object.values(exam.msk ?? {}).some((value) => value.trim());
}

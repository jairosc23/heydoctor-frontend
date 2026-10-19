import type { ConsultationAssistResponse } from "./clinical-ai-facade";

export type CopilotGenerativeContext = {
  chiefComplaint?: string | null;
  notes?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
};

export type CopilotGenerativeSectionView = {
  clinicalSummary: string;
  differentialDiagnoses: string[];
  suggestedConduct: string[];
  patientEducation: string[];
  followUp: string[];
};

const FOLLOW_UP_PATTERN = /seguim|control clínico|revisión|revisar|cita de|control en|semana|mes/i;

/** Resumen de contexto enviado al análisis — no inventa datos clínicos. */
export function buildGenerativeContextSummary(
  context: CopilotGenerativeContext,
): string {
  const parts: string[] = [];
  const chief = context.chiefComplaint?.trim();
  const notes = context.notes?.trim();
  const diagnosis = context.diagnosis?.trim();
  const treatment = context.treatment?.trim();

  if (chief) parts.push(`Motivo: ${chief}`);
  if (notes) {
    const excerpt = notes.length > 320 ? `${notes.slice(0, 320)}…` : notes;
    parts.push(`Notas: ${excerpt}`);
  }
  if (diagnosis) parts.push(`Diagnóstico documentado: ${diagnosis}`);
  if (treatment) parts.push(`Plan/tratamiento: ${treatment}`);

  if (parts.length === 0) {
    return "Sin motivo ni notas documentadas en la consulta. El análisis usará el contexto disponible en el servicio.";
  }
  return parts.join("\n");
}

export function partitionAssistRecommendations(recommendations: string[]): {
  conduct: string[];
  followUp: string[];
} {
  const conduct: string[] = [];
  const followUp: string[] = [];
  for (const line of recommendations) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (FOLLOW_UP_PATTERN.test(trimmed)) followUp.push(trimmed);
    else conduct.push(trimmed);
  }
  return { conduct, followUp };
}

/** Mapea ConsultationAssistResponse a las secciones UX del Copilot generativo. */
export function mapAssistToGenerativeView(
  assist: ConsultationAssistResponse,
  context: CopilotGenerativeContext,
): CopilotGenerativeSectionView {
  const { conduct, followUp } = partitionAssistRecommendations(
    assist.recommendations ?? [],
  );

  return {
    clinicalSummary: buildGenerativeContextSummary(context),
    differentialDiagnoses: assist.possibleDiagnoses ?? [],
    suggestedConduct: conduct,
    patientEducation: assist.generalEducation ?? [],
    followUp:
      followUp.length > 0
        ? followUp
        : conduct.length === 0 && (assist.possibleDiagnoses?.length ?? 0) === 0
          ? []
          : ["Control según evolución clínica y criterio del médico tratante."],
  };
}

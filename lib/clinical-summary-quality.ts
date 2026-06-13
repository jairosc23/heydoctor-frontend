import type { ConsultationAssistResponse } from "./services/consultation-assist";
import type { ConsultationSummaryResponse } from "./services/ai-clinical";

export const CLINICAL_NOTE_SECTION_ORDER = [
  "Motivo de consulta",
  "Anamnesis",
  "Antecedentes relevantes",
  "Examen clínico",
  "Impresión diagnóstica",
  "Conducta",
  "Educación",
  "Seguimiento",
] as const;

function dedupeLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const normalized = line.trim().replace(/\s+/g, " ");
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
  }
  return out;
}

function sectionBlock(title: string, body: string): string | null {
  const text = body.trim();
  if (!text) return null;
  return `${title}\n${text}`;
}

/** Phase 4.5 — nota clínica estructurada sin relleno redundante. */
export function formatStructuredClinicalNote(input: {
  chiefComplaint?: string | null;
  draftNotes?: string | null;
  treatment?: string | null;
  activeDiagnosis?: string | null;
  assist?: ConsultationAssistResponse | null;
  summary?: string | null;
}): string {
  const anamnesis =
    input.draftNotes?.trim() ||
    input.summary?.trim() ||
    "Pendiente de completar según interrogatorio y examen.";

  const impression = dedupeLines([
    ...(input.assist?.possibleDiagnoses ?? []),
    input.activeDiagnosis ?? "",
  ]);

  const conduct = dedupeLines(input.assist?.recommendations ?? []);
  const education = dedupeLines(input.assist?.generalEducation ?? []);

  const blocks = [
    sectionBlock(
      "Motivo de consulta",
      input.chiefComplaint?.trim() || "No documentado.",
    ),
    sectionBlock("Anamnesis", anamnesis),
    sectionBlock(
      "Antecedentes relevantes",
      impression.length > 1
        ? impression.slice(1).join("\n")
        : "Sin antecedentes adicionales documentados.",
    ),
    sectionBlock(
      "Examen clínico",
      "Por documentar en consulta. No inferir hallazgos no registrados.",
    ),
    sectionBlock(
      "Impresión diagnóstica",
      impression[0] ?? input.activeDiagnosis ?? "Por confirmar.",
    ),
    sectionBlock(
      "Conducta",
      [input.treatment?.trim(), ...conduct].filter(Boolean).join("\n") ||
        "Definir plan terapéutico según evaluación.",
    ),
    sectionBlock(
      "Educación",
      education.join("\n") || "Reforzar adherencia y signos de alarma.",
    ),
    sectionBlock(
      "Seguimiento",
      conduct.find((c) => /seguim|control|revis/i.test(c)) ??
        "Control según evolución clínica.",
    ),
  ].filter((b): b is string => Boolean(b));

  return blocks.join("\n\n");
}

export function enhanceConsultationSummary(
  summary: ConsultationSummaryResponse,
  input: {
    chiefComplaint?: string | null;
    draftNotes?: string | null;
    treatment?: string | null;
    activeDiagnosis?: string | null;
    assist?: ConsultationAssistResponse | null;
  },
): ConsultationSummaryResponse {
  const improved =
    summary.improvedNotes?.trim() &&
    summary.improvedNotes.trim().length >= 120 &&
    CLINICAL_NOTE_SECTION_ORDER.some((s) =>
      summary.improvedNotes!.includes(s),
    )
      ? summary.improvedNotes.trim()
      : formatStructuredClinicalNote({
          chiefComplaint: input.chiefComplaint,
          draftNotes: input.draftNotes,
          treatment: input.treatment,
          activeDiagnosis: input.activeDiagnosis,
          assist: input.assist,
          summary: summary.summary,
        });

  const suggestedDiagnosis = dedupeLines([
    ...(summary.suggestedDiagnosis ?? []),
    ...(input.assist?.possibleDiagnoses ?? []),
    input.activeDiagnosis ?? "",
  ]).slice(0, 6);

  const narrative =
    summary.summary?.trim() ||
    improved.split("\n\n")[0]?.trim() ||
    "Resumen clínico generado con asistencia documental.";

  return {
    summary: narrative,
    suggestedDiagnosis,
    improvedNotes: improved,
  };
}

export function mapAssistToClinicalSummary(
  assist: ConsultationAssistResponse,
  input: {
    chiefComplaint?: string | null;
    draftNotes?: string | null;
    treatment?: string | null;
    activeDiagnosis?: string | null;
  },
): ConsultationSummaryResponse {
  const improved = formatStructuredClinicalNote({
    chiefComplaint: input.chiefComplaint,
    draftNotes: input.draftNotes,
    treatment: input.treatment,
    activeDiagnosis: input.activeDiagnosis,
    assist,
  });

  return {
    summary: assist.assistiveOnlyNotice?.trim() || improved.split("\n\n")[0] || "",
    suggestedDiagnosis: dedupeLines(assist.possibleDiagnoses ?? []).slice(0, 6),
    improvedNotes: improved,
  };
}

export function isAiResponseEmpty(res: ConsultationSummaryResponse): boolean {
  return (
    !res.summary?.trim() &&
    !res.improvedNotes?.trim() &&
    (res.suggestedDiagnosis ?? []).length === 0
  );
}

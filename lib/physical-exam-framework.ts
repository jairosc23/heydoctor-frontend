/**
 * Phase 4.5.2 — PhysicalExamFramework™
 *
 * Estructura clínica reutilizable. Sin IA, sin inferencias.
 * Fuentes:
 * - Bloque `[[HD_PE_V1]]` en notes
 * - Revisión por sistemas legacy (`[[HD_CR_V1]]` → systemsReview) ingresada por el médico
 */

import { parseClinicalRecord, type SystemsReview } from "./services/clinical-record";

export const PHYSICAL_EXAM_SECTIONS = [
  "general",
  "head",
  "neck",
  "cardiovascular",
  "respiratory",
  "abdomen",
  "neurological",
  "extremities",
  "skin",
  "other",
] as const;

export type PhysicalExamSection = (typeof PHYSICAL_EXAM_SECTIONS)[number];

export type PhysicalExam = Record<PhysicalExamSection, string>;

export const PHYSICAL_EXAM_SECTION_LABELS: Record<PhysicalExamSection, string> =
  {
    general: "General",
    head: "Cabeza",
    neck: "Cuello",
    cardiovascular: "Cardiovascular",
    respiratory: "Respiratorio",
    abdomen: "Abdomen",
    neurological: "Neurológico",
    extremities: "Extremidades",
    skin: "Piel",
    other: "Otros",
  };

export const EMPTY_PHYSICAL_EXAM: PhysicalExam = {
  general: "",
  head: "",
  neck: "",
  cardiovascular: "",
  respiratory: "",
  abdomen: "",
  neurological: "",
  extremities: "",
  skin: "",
  other: "",
};

export const PHYSICAL_EXAM_MARKER = "[[HD_PE_V1]]";
export const PHYSICAL_EXAM_END = "[[/HD_PE_V1]]";

type PersistedPhysicalExam = {
  v: 1;
  heent?: string;
} & Partial<PhysicalExam>;

function safeParseJson(s: string): PersistedPhysicalExam | null {
  try {
    const parsed = JSON.parse(s) as PersistedPhysicalExam;
    if (parsed && typeof parsed === "object" && parsed.v === 1) return parsed;
    return null;
  } catch {
    return null;
  }
}

function trimSections(raw: Partial<PhysicalExam> & { heent?: string }): PhysicalExam {
  const out = { ...EMPTY_PHYSICAL_EXAM };
  for (const key of PHYSICAL_EXAM_SECTIONS) {
    out[key] = raw[key]?.trim() ?? "";
  }
  if (!out.head && !out.neck && raw.heent?.trim()) {
    out.head = raw.heent.trim();
  }
  return out;
}

/** Mapeo desde revisión por sistemas legacy (ficha clínica existente). */
export function physicalExamFromLegacySystemsReview(
  review: SystemsReview | Partial<SystemsReview> | null | undefined,
): PhysicalExam {
  if (!review) return { ...EMPTY_PHYSICAL_EXAM };
  return trimSections({
    cardiovascular: review.cardiovascular,
    respiratory: review.respiratory,
    abdomen: review.digestive,
    neurological: review.neurological,
    skin: review.skin,
    other: review.genitourinary,
  });
}

function parsePhysicalExamMarker(notes: string): PhysicalExam | null {
  const start = notes.indexOf(PHYSICAL_EXAM_MARKER);
  if (start === -1) return null;
  const end = notes.indexOf(PHYSICAL_EXAM_END, start);
  const jsonPart =
    end >= 0
      ? notes.slice(start + PHYSICAL_EXAM_MARKER.length, end).trim()
      : notes.slice(start + PHYSICAL_EXAM_MARKER.length).trim();
  const parsed = safeParseJson(jsonPart);
  if (!parsed) return null;
  return trimSections(parsed);
}

/** Solo el bloque HD_PE_V1 — sin merge con legacy (para edición en encounter). */
export function parsePhysicalExamMarkerOnly(
  notes: string | null | undefined,
): PhysicalExam {
  if (!notes?.trim()) return { ...EMPTY_PHYSICAL_EXAM };
  return parsePhysicalExamMarker(notes) ?? { ...EMPTY_PHYSICAL_EXAM };
}

export function mergePhysicalExam(
  ...sources: Array<PhysicalExam | null | undefined>
): PhysicalExam {
  const out = { ...EMPTY_PHYSICAL_EXAM };
  for (const src of sources) {
    if (!src) continue;
    for (const key of PHYSICAL_EXAM_SECTIONS) {
      const value = src[key]?.trim();
      if (value && !out[key]) out[key] = value;
    }
  }
  return out;
}

export function hasPhysicalExamData(exam: PhysicalExam): boolean {
  return PHYSICAL_EXAM_SECTIONS.some((key) => exam[key]?.trim());
}

export function resolvePhysicalExamFromNotes(
  notes: string | null | undefined,
): PhysicalExam {
  if (!notes?.trim()) return { ...EMPTY_PHYSICAL_EXAM };

  const fromMarker = parsePhysicalExamMarker(notes);
  const record = parseClinicalRecord(notes);
  const fromLegacy = physicalExamFromLegacySystemsReview(record.systemsReview);

  return mergePhysicalExam(fromMarker, fromLegacy);
}

export function serializePhysicalExam(exam: PhysicalExam): string | null {
  const trimmed = trimSections(exam);
  if (!hasPhysicalExamData(trimmed)) return null;

  const payload: PersistedPhysicalExam = { v: 1 };
  for (const key of PHYSICAL_EXAM_SECTIONS) {
    if (trimmed[key]) payload[key] = trimmed[key];
  }

  return `${PHYSICAL_EXAM_MARKER}\n${JSON.stringify(payload)}\n${PHYSICAL_EXAM_END}`;
}

export function formatPhysicalExamForContext(exam: PhysicalExam): string | null {
  if (!hasPhysicalExamData(exam)) return null;

  const lines: string[] = ["Examen físico documentado:"];
  for (const key of PHYSICAL_EXAM_SECTIONS) {
    const value = exam[key]?.trim();
    if (!value) continue;
    lines.push(`- ${PHYSICAL_EXAM_SECTION_LABELS[key]}: ${value}`);
  }

  return lines.length > 1 ? lines.join("\n") : null;
}

/** Texto para sección SOAP — vacío si no hay datos documentados. */
export function formatPhysicalExamForSoap(exam: PhysicalExam): string {
  if (!hasPhysicalExamData(exam)) return "";
  return (
    formatPhysicalExamForContext(exam)
      ?.replace(/^Examen físico documentado:\n?/, "")
      .split("\n")
      .map((line) => line.replace(/^- /, ""))
      .join("\n") ?? ""
  );
}

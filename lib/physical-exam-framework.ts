/**
 * Phase 4.5.2 — PhysicalExamFramework™
 *
 * Estructura clínica reutilizable. Sin IA, sin inferencias.
 * Fuentes:
 * - Bloque `[[HD_PE_V1]]` en notes
 * - Revisión por sistemas legacy (`[[HD_CR_V1]]` → systemsReview) ingresada por el médico
 *
 * CW-1: bolsa `msk` versionada (columna lumbar + regiones futuras) sin romper
 * encounters históricos. Keys desconocidas en `msk` se preservan en round-trip.
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

/** Regiones MSK registradas en UI (extensible sin migrar encounters). */
export const MSK_EXAM_REGIONS = ["lumbar"] as const;

export type MskExamRegion = (typeof MSK_EXAM_REGIONS)[number];

export const MSK_EXAM_REGION_LABELS: Record<MskExamRegion, string> = {
  lumbar: "Columna lumbar",
};

export type PhysicalExam = Record<PhysicalExamSection, string> & {
  /**
   * Hallazgos musculoesqueléticos. Incluye regiones registradas y cualquier
   * key string adicional preservada desde el marcador (forward-compat).
   */
  msk: Record<string, string>;
};

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

export function emptyMskExam(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const region of MSK_EXAM_REGIONS) {
    out[region] = "";
  }
  return out;
}

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
  msk: emptyMskExam(),
};

export const PHYSICAL_EXAM_MARKER = "[[HD_PE_V1]]";
export const PHYSICAL_EXAM_END = "[[/HD_PE_V1]]";

type PersistedPhysicalExam = {
  v: 1;
  heent?: string;
  /** Bolsa MSK opcional (ausente en encounters pre–CW-1). */
  msk?: Record<string, string>;
} & Partial<Record<PhysicalExamSection, string>>;

function safeParseJson(s: string): PersistedPhysicalExam | null {
  try {
    const parsed = JSON.parse(s) as PersistedPhysicalExam;
    if (parsed && typeof parsed === "object" && parsed.v === 1) return parsed;
    return null;
  } catch {
    return null;
  }
}

function trimMsk(raw: unknown): Record<string, string> {
  const out = emptyMskExam();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) {
      out[key] = trimmed;
    } else if (key in out) {
      out[key] = "";
    }
  }
  return out;
}

function trimSections(
  raw: Partial<Record<PhysicalExamSection, string>> & {
    heent?: string;
    msk?: unknown;
  },
): PhysicalExam {
  const out: PhysicalExam = {
    ...EMPTY_PHYSICAL_EXAM,
    msk: emptyMskExam(),
  };
  for (const key of PHYSICAL_EXAM_SECTIONS) {
    out[key] = raw[key]?.trim() ?? "";
  }
  if (!out.head && !out.neck && raw.heent?.trim()) {
    out.head = raw.heent.trim();
  }
  out.msk = trimMsk(raw.msk);
  return out;
}

/** Mapeo desde revisión por sistemas legacy (ficha clínica existente). */
export function physicalExamFromLegacySystemsReview(
  review: SystemsReview | Partial<SystemsReview> | null | undefined,
): PhysicalExam {
  if (!review) return { ...EMPTY_PHYSICAL_EXAM, msk: emptyMskExam() };
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
  if (!notes?.trim()) return { ...EMPTY_PHYSICAL_EXAM, msk: emptyMskExam() };
  return parsePhysicalExamMarker(notes) ?? {
    ...EMPTY_PHYSICAL_EXAM,
    msk: emptyMskExam(),
  };
}

export function mergePhysicalExam(
  ...sources: Array<PhysicalExam | null | undefined>
): PhysicalExam {
  const out: PhysicalExam = {
    ...EMPTY_PHYSICAL_EXAM,
    msk: emptyMskExam(),
  };
  for (const src of sources) {
    if (!src) continue;
    for (const key of PHYSICAL_EXAM_SECTIONS) {
      const value = src[key]?.trim();
      if (value && !out[key]) out[key] = value;
    }
    if (src.msk) {
      for (const [region, value] of Object.entries(src.msk)) {
        const trimmed = value?.trim();
        if (trimmed && !out.msk[region]?.trim()) {
          out.msk[region] = trimmed;
        } else if (!(region in out.msk)) {
          out.msk[region] = value?.trim() ?? "";
        }
      }
    }
  }
  return out;
}

export function hasPhysicalExamData(exam: PhysicalExam): boolean {
  if (PHYSICAL_EXAM_SECTIONS.some((key) => exam[key]?.trim())) return true;
  return Object.values(exam.msk ?? {}).some((value) => value?.trim());
}

export function resolvePhysicalExamFromNotes(
  notes: string | null | undefined,
): PhysicalExam {
  if (!notes?.trim()) return { ...EMPTY_PHYSICAL_EXAM, msk: emptyMskExam() };

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

  const mskPayload: Record<string, string> = {};
  for (const [region, value] of Object.entries(trimmed.msk)) {
    if (value?.trim()) mskPayload[region] = value.trim();
  }
  if (Object.keys(mskPayload).length > 0) {
    payload.msk = mskPayload;
  }

  return `${PHYSICAL_EXAM_MARKER}\n${JSON.stringify(payload)}\n${PHYSICAL_EXAM_END}`;
}

function mskRegionLabel(region: string): string {
  if (region in MSK_EXAM_REGION_LABELS) {
    return MSK_EXAM_REGION_LABELS[region as MskExamRegion];
  }
  return region;
}

export function formatPhysicalExamForContext(exam: PhysicalExam): string | null {
  if (!hasPhysicalExamData(exam)) return null;

  const lines: string[] = ["Examen físico documentado:"];
  for (const key of PHYSICAL_EXAM_SECTIONS) {
    const value = exam[key]?.trim();
    if (!value) continue;
    lines.push(`- ${PHYSICAL_EXAM_SECTION_LABELS[key]}: ${value}`);
  }
  for (const region of [
    ...MSK_EXAM_REGIONS,
    ...Object.keys(exam.msk ?? {}).filter(
      (key) => !(MSK_EXAM_REGIONS as readonly string[]).includes(key),
    ),
  ]) {
    const value = exam.msk?.[region]?.trim();
    if (!value) continue;
    lines.push(`- ${mskRegionLabel(region)}: ${value}`);
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

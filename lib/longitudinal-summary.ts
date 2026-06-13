/**
 * Phase 4.5.2 — LongitudinalSummary™ / Recent Clinical Context™
 *
 * Deriva contexto longitudinal desde Clinical Memory (recentConsultations).
 * NO modifica Timeline Engine ni Timeline UX.
 */

import type { PatientClinicalMemory } from "./types/clinical-memory";

export type LongitudinalConsultationEntry = {
  consultationId: string;
  date: string;
  dateLabel: string;
  primaryDiagnosis: string | null;
  chiefComplaint: string | null;
  conduct: string | null;
  status: string;
};

export type LongitudinalSummary = {
  entries: LongitudinalConsultationEntry[];
  hasData: boolean;
  source: "clinical_memory" | "none";
};

export const LONGITUDINAL_SUMMARY_LIMIT = 3;

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function diagnosisLabel(
  code: string | null,
  label: string | null,
): string | null {
  const parts = [code, label].filter((p) => p?.trim());
  if (parts.length === 0) return null;
  return parts.join(" — ");
}

/**
 * Construye resumen longitudinal desde memoria clínica.
 * Motivo y conducta no están en el DTO actual — se documentan como null.
 */
export function buildLongitudinalSummary(
  memory: PatientClinicalMemory | null | undefined,
  options?: {
    currentConsultationId?: string | null;
    maxEntries?: number;
    now?: Date;
  },
): LongitudinalSummary {
  const maxEntries = options?.maxEntries ?? LONGITUDINAL_SUMMARY_LIMIT;
  const currentId = options?.currentConsultationId?.trim();

  if (!memory?.recentConsultations?.length) {
    return { entries: [], hasData: false, source: "none" };
  }

  const sorted = [...memory.recentConsultations]
    .filter((c) => !currentId || c.id !== currentId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, maxEntries);

  const entries: LongitudinalConsultationEntry[] = sorted.map((c) => ({
    consultationId: c.id,
    date: c.createdAt,
    dateLabel: formatDateLabel(c.createdAt),
    primaryDiagnosis: diagnosisLabel(c.diagnosisCode, c.diagnosisLabel),
    chiefComplaint: null,
    conduct: null,
    status: c.status,
  }));

  return {
    entries,
    hasData: entries.length > 0,
    source: "clinical_memory",
  };
}

export function formatLongitudinalSummaryForContext(
  summary: LongitudinalSummary,
): string | null {
  if (!summary.hasData) return null;

  const lines: string[] = ["Contexto clínico reciente (últimas consultas):"];
  for (const entry of summary.entries) {
    const parts = [`${entry.dateLabel}`];
    if (entry.primaryDiagnosis) parts.push(`Dx: ${entry.primaryDiagnosis}`);
    if (entry.chiefComplaint) parts.push(`Motivo: ${entry.chiefComplaint}`);
    if (entry.conduct) parts.push(`Conducta: ${entry.conduct}`);
    lines.push(`- ${parts.join(" · ")}`);
  }

  return lines.join("\n");
}

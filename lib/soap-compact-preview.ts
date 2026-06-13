/** Phase 4.4A — helpers para Compact Preview Mode™ en bloques SOAP. */

export function firstLineOrFallback(
  text: string | null | undefined,
  fallback: string,
): string {
  const line = String(text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find(Boolean);
  return line ?? fallback;
}

export function formatDiagnosisPreview(input: {
  code?: string | null;
  description?: string | null;
  diagnosisText?: string | null;
}): string {
  const code = input.code?.trim();
  const description = input.description?.trim();
  if (code && description) {
    return `${code} — ${description}`;
  }
  if (code) return code;
  if (description) return description;
  const parsed = input.diagnosisText?.trim();
  if (parsed) return parsed;
  return "Sin diagnóstico";
}

export function formatPlanPreviewCounts(input: {
  actionCount: number;
  labCount: number;
  recommendationCount: number;
  loading?: boolean;
  hasDiagnosis?: boolean;
}): string {
  if (input.loading) return "Preparando plan clínico…";
  if (!input.hasDiagnosis) return "Seleccione diagnóstico CIE-10";
  if (input.actionCount === 0 && input.labCount === 0 && input.recommendationCount === 0) {
    return "Plan en preparación…";
  }
  const parts: string[] = [];
  if (input.actionCount > 0) {
    parts.push(
      `${input.actionCount} ${input.actionCount === 1 ? "acción" : "acciones"}`,
    );
  }
  if (input.labCount > 0) {
    parts.push(
      `${input.labCount} ${input.labCount === 1 ? "laboratorio" : "laboratorios"}`,
    );
  }
  if (input.recommendationCount > 0) {
    parts.push(
      `${input.recommendationCount} ${input.recommendationCount === 1 ? "recomendación" : "recomendaciones"}`,
    );
  }
  return parts.join(" · ");
}

/**
 * CP-32 — Pure heuristic analyzer for dictated clinical text.
 * Does not mutate dictation, call LLMs, or persist results.
 */

import {
  CLINICAL_VOICE_INTELLIGENCE_GOVERNANCE,
  DEFAULT_EXPECTED_SECTIONS,
  type ClinicalSuggestion,
  type ClinicalVoiceAnalysis,
  type ClinicalVoiceIntelligenceOptions,
} from "./types";

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Stable non-cryptographic hash for cache-busting in UI (not security). */
export function hashDictationText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return `h${(hash >>> 0).toString(16)}`;
}

function suggestion(
  partial: Omit<
    ClinicalSuggestion,
    "requiresPhysicianReview" | "autoAppliesToDictation" | "suggestionId"
  > & { suggestionId?: string },
): ClinicalSuggestion {
  return {
    suggestionId: partial.suggestionId ?? createId("sug"),
    type: partial.type,
    severity: partial.severity,
    title: partial.title,
    detail: partial.detail,
    requiresPhysicianReview: true,
    autoAppliesToDictation: false,
  };
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * Analyze dictated text and return ephemeral structured suggestions.
 */
export function analyzeClinicalVoiceText(
  text: string,
  options: ClinicalVoiceIntelligenceOptions = {},
): ClinicalVoiceAnalysis {
  const draft = text.trim();
  const normalized = normalize(draft);
  const minCompleteLength = options.minCompleteLength ?? 40;
  const expectedSections =
    options.expectedSections ?? [...DEFAULT_EXPECTED_SECTIONS];
  const reminders = options.reminders ?? [];

  const suggestions: ClinicalSuggestion[] = [];

  if (!draft) {
    suggestions.push(
      suggestion({
        type: "incomplete_text",
        severity: "info",
        title: "Sin texto dictado",
        detail:
          "Aún no hay contenido en el buffer de dictado. Inicie el dictado o escriba notas para recibir sugerencias.",
      }),
    );
  } else {
    if (draft.length < minCompleteLength) {
      suggestions.push(
        suggestion({
          type: "incomplete_text",
          severity: "attention",
          title: "Texto potencialmente incompleto",
          detail: `El dictado tiene ${draft.length} caracteres (umbral ${minCompleteLength}). Considere ampliar anamnesis o hallazgos relevantes.`,
        }),
      );
    }

    if (/(\.\.\.|…|\betc\.?\b|\bincompleto\b)/i.test(draft)) {
      suggestions.push(
        suggestion({
          type: "incomplete_text",
          severity: "attention",
          title: "Marcas de incompletitud detectadas",
          detail:
            "Se detectaron elipsis o expresiones de incompletitud. Revise si falta información clínica.",
        }),
      );
    }

    const missingSections = expectedSections.filter(
      (section) => !normalized.includes(normalize(section)),
    );
    if (missingSections.length > 0 && draft.length >= 20) {
      suggestions.push(
        suggestion({
          type: "pending_clinical_section",
          severity: "attention",
          title: "Secciones clínicas pendientes",
          detail: `No se mencionan explícitamente: ${missingSections.join(", ")}. Esto es orientativo; no implica que deban dictarse con esas etiquetas.`,
        }),
      );
    }

    const openParens = (draft.match(/\(/g) ?? []).length;
    const closeParens = (draft.match(/\)/g) ?? []).length;
    if (openParens !== closeParens) {
      suggestions.push(
        suggestion({
          type: "structural_inconsistency",
          severity: "review",
          title: "Posible inconsistencia estructural",
          detail:
            "Paréntesis desbalanceados en el texto. Revise puntuación o listas clínicas.",
        }),
      );
    }

    if (/\b(siempre|nunca|todos los pacientes)\b/i.test(draft)) {
      suggestions.push(
        suggestion({
          type: "manual_review",
          severity: "review",
          title: "Indicador de revisión manual",
          detail:
            "Lenguaje absoluto detectado. Verifique que las afirmaciones sean clínicamente precisas para este paciente.",
        }),
      );
    }

    if (draft.length >= minCompleteLength) {
      suggestions.push(
        suggestion({
          type: "manual_review",
          severity: "info",
          title: "Revisión médica recomendada",
          detail:
            "Las sugerencias son no vinculantes. El médico debe revisar el dictado antes de cualquier uso clínico.",
        }),
      );
    }
  }

  for (const reminder of reminders) {
    const title = reminder.trim();
    if (!title) continue;
    suggestions.push(
      suggestion({
        type: "configurable_reminder",
        severity: "info",
        title,
        detail:
          "Recordatorio configurado por el host. No modifica el texto del dictado.",
      }),
    );
  }

  // Deduplicate by type+title for stable UI
  const seen = new Set<string>();
  const unique = suggestions.filter((item) => {
    const key = `${item.type}:${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    analysisId: createId("cva"),
    analyzedAt: new Date().toISOString(),
    sourceTextLength: draft.length,
    sourceTextHash: hashDictationText(draft),
    suggestions: unique,
    governance: { ...CLINICAL_VOICE_INTELLIGENCE_GOVERNANCE },
  };
}

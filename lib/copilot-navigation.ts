/**
 * Phase 4.8.3C — Copilot Navigation types & helpers
 */

export type CopilotSectionId = "generative";

export const COPILOT_HUB_CTA_COPY =
  "Disponible también desde Clinical Copilot™";

export type CopilotRedirectEntryPoint = {
  id: string;
  label: string;
  phase483cBehavior: "redirect_to_copilot_generative" | "unchanged";
};

/** Entry points migrados en 4.8.3C hacia Clinical Copilot™ generativo. */
export const COPILOT_REDIRECT_ENTRY_POINTS: CopilotRedirectEntryPoint[] = [
  {
    id: "menu-analisis-clinico-ia",
    label: "Menú ⋯ Análisis clínico con IA",
    phase483cBehavior: "redirect_to_copilot_generative",
  },
  {
    id: "encounter-action-menu-analisis",
    label: "EncounterActionMenu → onAnalyzeWithAi",
    phase483cBehavior: "redirect_to_copilot_generative",
  },
  {
    id: "clinical-module-sheet-analisis",
    label: "ClinicalModuleSheet documentHandlers.onAnalyzeWithAi",
    phase483cBehavior: "redirect_to_copilot_generative",
  },
  {
    id: "tab-asistencia-assist",
    label: "Tab Asistencia → ConsultationAssistPanel",
    phase483cBehavior: "unchanged",
  },
  {
    id: "tab-asistencia-insights",
    label: "Tab Asistencia → AiInsightsPanel",
    phase483cBehavior: "unchanged",
  },
  {
    id: "ficha-autollenar",
    label: "ClinicalRecordPanel → Autollenar con IA",
    phase483cBehavior: "unchanged",
  },
  {
    id: "live-ai-notes",
    label: "LiveAiNoteSuggestions™",
    phase483cBehavior: "unchanged",
  },
];

export function shouldExpandGenerativeForSection(
  section: CopilotSectionId,
): boolean {
  return section === "generative";
}

export function countRedirectedEntryPoints(
  entries: CopilotRedirectEntryPoint[] = COPILOT_REDIRECT_ENTRY_POINTS,
): number {
  return entries.filter(
    (e) => e.phase483cBehavior === "redirect_to_copilot_generative",
  ).length;
}

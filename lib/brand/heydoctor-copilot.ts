/**
 * HeyDoctor Copilot — user-facing brand strings (SSOT).
 * Source: docs/brand/HEYDOCTOR-COPILOT-BRAND.md
 *
 * Branding layer only. Does not rename runtimes, APIs, routes, or contracts.
 */

export const HEYDOCTOR_COPILOT_BRAND = {
  productName: "HeyDoctor Copilot",
  subtitle: "AI-First Clinical Intelligence",
  subtitleEs: "Inteligencia Clínica AI-First",
  authorityBadge: "NON-AUTHORITY",
  authorityBadgeEs: "SIN AUTORIDAD CLÍNICA",
} as const;

export const HEYDOCTOR_COPILOT_SECTIONS = [
  { id: "clinical-insights", label: "Clinical Insights" },
  { id: "assistant", label: "Assistant" },
  { id: "recommendations", label: "Recommendations" },
  { id: "explainability", label: "Explainability" },
  { id: "evidence", label: "Evidence" },
] as const;

export type HeyDoctorCopilotSectionId =
  (typeof HEYDOCTOR_COPILOT_SECTIONS)[number]["id"];

export const HEYDOCTOR_COPILOT_DEFAULT_SECTION: HeyDoctorCopilotSectionId =
  "clinical-insights";

/** Primary open/close copy */
export const HEYDOCTOR_COPILOT_COPY = {
  open: "Abrir HeyDoctor Copilot",
  openShort: "Copilot",
  opened: "HeyDoctor Copilot abierto",
  close: "Cerrar HeyDoctor Copilot",
  analyze: "Analizar con HeyDoctor Copilot",
  autofill: "Autollenar con HeyDoctor Copilot",
  generating: "Generando con HeyDoctor Copilot…",
  suggestions: "Sugerencias HeyDoctor Copilot",
  suggestionsBusy: "Copilot…",
  loading: "Cargando HeyDoctor Copilot…",
  loadErrorTitle: "No se pudo cargar HeyDoctor Copilot",
  loadError: "Error en HeyDoctor Copilot",
  waitingSession: "Esperando sesión HeyDoctor Copilot…",
  sessionUnavailable: "Sesión HeyDoctor Copilot no disponible",
  assistTitle: "Assistant",
  assistAria: "HeyDoctor Copilot · Assistant",
  assistToggleShow: "Assistant",
  assistToggleHide: "Ocultar Assistant",
  presenceAria: "HeyDoctor Copilot (MODEL, advisory)",
  assistPlaneAria: "HeyDoctor Copilot (advisory)",
  toastOpen:
    "Abriendo HeyDoctor Copilot — asistencia generativa lista para analizar.",
  hubCtaHint: "Disponible también desde HeyDoctor Copilot",
  openingGenerative: "Abrir asistente generativo",
} as const;

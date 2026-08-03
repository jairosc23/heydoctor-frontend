/**
 * HeyDoctor Copilot — user-facing brand strings (SSOT).
 * Source: docs/brand/HEYDOCTOR-COPILOT-BRAND.md
 *
 * Branding / product experience layer only.
 * Does not rename runtimes, APIs, routes, or contracts.
 */

export const HEYDOCTOR_COPILOT_BRAND = {
  productName: "HeyDoctor Copilot",
  subtitle: "AI-First Clinical Intelligence",
  subtitleEs: "Inteligencia Clínica AI-First",
  /** OFFICIAL / FROZEN — product philosophy, not a slogan. Use sparingly in UI. */
  brandPromiseLine1: "The physician starts the encounter.",
  brandPromiseLine2: "HeyDoctor Copilot understands the clinical context.",
  brandPromiseEsLine1: "El médico inicia el encuentro.",
  brandPromiseEsLine2: "HeyDoctor Copilot comprende el contexto clínico.",
  mission:
    "The unified clinical intelligence platform that assists physicians before, during and after every patient encounter.",
  missionEs:
    "La plataforma unificada de inteligencia clínica que asiste a los médicos antes, durante y después de cada encuentro clínico.",
  authorityBadge: "NON-AUTHORITY",
  authorityBadgeEs: "SIN AUTORIDAD CLÍNICA",
  humanInTheLoop: "Human-in-the-Loop",
  evidenceDriven: "Evidence-Driven",
} as const;

/** Capability continuum — views of one intelligence (not independent modules). */
export const HEYDOCTOR_COPILOT_CAPABILITIES = [
  { id: "clinical-insights", label: "Clinical Insights", home: true },
  { id: "assistant", label: "Assistant", home: false },
  { id: "recommendations", label: "Recommendations", home: false },
  { id: "explainability", label: "Explainability", home: false },
  { id: "evidence", label: "Evidence", home: false },
] as const;

/** @deprecated Use HEYDOCTOR_COPILOT_CAPABILITIES */
export const HEYDOCTOR_COPILOT_SECTIONS = HEYDOCTOR_COPILOT_CAPABILITIES;

export type HeyDoctorCopilotSectionId =
  (typeof HEYDOCTOR_COPILOT_CAPABILITIES)[number]["id"];

export const HEYDOCTOR_COPILOT_DEFAULT_SECTION: HeyDoctorCopilotSectionId =
  "clinical-insights";

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
  insightsHomeLabel: "Clinical Insights",
  insightsHomeHint: "Live intelligence for this encounter — no prompt required.",
  continuumAria: "HeyDoctor Copilot capabilities",
  continuumHint: "Same intelligence · different views",
  trustFooter: "You remain in control",
} as const;

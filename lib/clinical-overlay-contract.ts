/**
 * Phase 4.2 — Overlay stacking contract (Clinical Action Workspace™).
 * Chrome < Module Sheet < Intelligence < System modals.
 */

export const CLINICAL_OVERLAY_Z = {
  chrome: 30,
  moduleBackdrop: 45,
  modulePanel: 46,
  intelligenceBackdrop: 40,
  intelligencePanel: 50,
  system: 60,
} as const;

export type ClinicalOverlayLayer = keyof typeof CLINICAL_OVERLAY_Z;

export const CLINICAL_OVERLAY_BACKDROP_CLASS = {
  module: "clinical-overlay-backdrop-module",
  intelligence: "clinical-overlay-backdrop-intelligence",
} as const;

export const CLINICAL_OVERLAY_PANEL_CLASS = {
  module: "clinical-overlay-panel-module",
  intelligence: "clinical-overlay-panel-intelligence",
} as const;

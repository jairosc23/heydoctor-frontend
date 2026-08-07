/**
 * Encounter Shell overlay stacking contract.
 * Chrome < Continuity < Module Sheet < Intelligence < Full Record < System.
 *
 * Continuity must sit ABOVE chrome menus but BELOW module sheet, and its
 * portal shell must use pointer-events:none so the rail/chart stay clickable.
 */

export const CLINICAL_OVERLAY_Z = {
  chrome: 30,
  continuity: 36,
  moduleBackdrop: 45,
  modulePanel: 46,
  intelligenceBackdrop: 40,
  intelligencePanel: 50,
  /** In-shell Full Clinical Record — above intelligence drawer, below system. */
  fullRecord: 55,
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

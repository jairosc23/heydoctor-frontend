/**
 * Product overlay stacking contract (SSOT).
 *
 * chrome < drawers < navigation < modal < dialog < system
 *
 * Navigation (sidebar) is always above Drawers. Drawer backdrops are clipped
 * to the clinical content inset and never cover sidebar, panel navigation,
 * encounter chrome, or "volver a consultas".
 *
 * Consumers must use layer names / classes only. No ad-hoc z-index values.
 */

export const CLINICAL_OVERLAY_LAYER_ORDER = [
  "chrome",
  "drawers",
  "navigation",
  "modal",
  "dialog",
  "system",
] as const;

export type ClinicalOverlayLayer = (typeof CLINICAL_OVERLAY_LAYER_ORDER)[number];

export const CLINICAL_OVERLAY_Z = {
  chrome: 100,
  drawers: 200,
  navigation: 300,
  modal: 400,
  dialog: 500,
  system: 600,
} as const satisfies Record<ClinicalOverlayLayer, number>;

export const CLINICAL_OVERLAY_CLASS = {
  chrome: "clinical-overlay-chrome",
  drawers: "clinical-overlay-drawers",
  navigation: "clinical-overlay-navigation",
  modal: "clinical-overlay-modal",
  dialog: "clinical-overlay-dialog",
  system: "clinical-overlay-system",
} as const satisfies Record<ClinicalOverlayLayer, string>;

/**
 * Shared by Clinical Copilot, Doctor DNA, and Clinical Module Sheet.
 * Geometry lives in `.clinical-overlay-clinical-content` (globals.css).
 */
export const CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS = [
  CLINICAL_OVERLAY_CLASS.drawers,
  "clinical-overlay-clinical-content",
].join(" ");

export const CLINICAL_OVERLAY_DRAWER_PANEL_CLASS = [
  CLINICAL_OVERLAY_CLASS.drawers,
  "clinical-overlay-clinical-content-y",
].join(" ");

/** Blocking dialog/modal backdrop — same inset as drawers, dialog stacking. */
export const CLINICAL_OVERLAY_DIALOG_BACKDROP_CLASS = [
  CLINICAL_OVERLAY_CLASS.dialog,
  "clinical-overlay-clinical-content",
].join(" ");

export const CLINICAL_OVERLAY_MODAL_BACKDROP_CLASS = [
  CLINICAL_OVERLAY_CLASS.modal,
  "clinical-overlay-clinical-content",
].join(" ");

export function overlayLayerOf(z: number): ClinicalOverlayLayer | null {
  const match = CLINICAL_OVERLAY_LAYER_ORDER.find(
    (layer) => CLINICAL_OVERLAY_Z[layer] === z,
  );
  return match ?? null;
}

import type {
  ClinicalDecisionHttpCapability,
  ClinicalDecisionPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catálogo local ni reglas de Gate en el frontend.
 */
export function decisionCapabilityFromPreview(
  preview: ClinicalDecisionPreviewResponse,
): ClinicalDecisionHttpCapability {
  return preview.data.capability;
}

export function isDecisionPreviewEnabled(
  capability: ClinicalDecisionHttpCapability,
): boolean {
  return capability.inClinicalEngineScope && capability.supportsPreview;
}

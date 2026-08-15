import type {
  ClinicalOrderHttpCapability,
  ClinicalOrderPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catálogo local ni reglas de Gate en el frontend.
 */
export function orderCapabilityFromPreview(
  preview: ClinicalOrderPreviewResponse,
): ClinicalOrderHttpCapability {
  return preview.data.capability;
}

export function isOrderPreviewEnabled(
  capability: ClinicalOrderHttpCapability,
): boolean {
  return capability.inClinicalEngineScope && capability.supportsPreview;
}

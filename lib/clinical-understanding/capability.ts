import type {
  ClinicalUnderstandingHttpCapability,
  ClinicalUnderstandingPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function understandingCapabilityFromPreview(
  preview: ClinicalUnderstandingPreviewResponse,
): ClinicalUnderstandingHttpCapability {
  return preview.data.capability;
}

export function isClinicalUnderstandingPreviewEnabled(
  capability: ClinicalUnderstandingHttpCapability,
): boolean {
  return (
    capability.inClinicalUnderstandingScope && capability.supportsPreview
  );
}

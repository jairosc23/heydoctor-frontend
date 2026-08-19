import type {
  ClinicalAuthorityHttpCapability,
  ClinicalAuthorityPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catálogo local ni reglas de Gate en el frontend.
 */
export function authorityCapabilityFromPreview(
  preview: ClinicalAuthorityPreviewResponse,
): ClinicalAuthorityHttpCapability {
  return preview.data.capability;
}

export function isAuthorityPreviewEnabled(
  capability: ClinicalAuthorityHttpCapability,
): boolean {
  return capability.inAuthoritySpineScope && capability.supportsPreview;
}

import type {
  ClinicalArtifactHttpCapability,
  ClinicalArtifactPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function artifactCapabilityFromPreview(
  preview: ClinicalArtifactPreviewResponse,
): ClinicalArtifactHttpCapability {
  return preview.data.capability;
}

export function isArtifactPreviewEnabled(
  capability: ClinicalArtifactHttpCapability,
): boolean {
  return capability.inRegistryScope && capability.supportsPreview;
}

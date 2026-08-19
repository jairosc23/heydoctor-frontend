import type {
  ClinicalRecommendationHttpCapability,
  ClinicalRecommendationPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function recommendationCapabilityFromPreview(
  preview: ClinicalRecommendationPreviewResponse,
): ClinicalRecommendationHttpCapability {
  return preview.data.capability;
}

export function isClinicalRecommendationPreviewEnabled(
  capability: ClinicalRecommendationHttpCapability,
): boolean {
  return (
    capability.inClinicalRecommendationScope && capability.supportsPreview
  );
}

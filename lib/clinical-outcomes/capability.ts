import type {
  ClinicalOutcomeHttpCapability,
  ClinicalOutcomePreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function outcomeCapabilityFromPreview(
  preview: ClinicalOutcomePreviewResponse,
): ClinicalOutcomeHttpCapability {
  return preview.data.capability;
}

export function isClinicalOutcomePreviewEnabled(
  capability: ClinicalOutcomeHttpCapability,
): boolean {
  return capability.inClinicalOutcomesScope && capability.supportsPreview;
}

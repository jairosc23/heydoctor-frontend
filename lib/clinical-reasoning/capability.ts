import type {
  ClinicalReasoningHttpCapability,
  ClinicalReasoningPreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function reasoningCapabilityFromPreview(
  preview: ClinicalReasoningPreviewResponse,
): ClinicalReasoningHttpCapability {
  return preview.data.capability;
}

export function isClinicalReasoningPreviewEnabled(
  capability: ClinicalReasoningHttpCapability,
): boolean {
  return capability.inClinicalReasoningScope && capability.supportsPreview;
}

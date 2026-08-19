import type {
  LongitudinalClinicalRecordPreviewResponse,
  LongitudinalHttpCapability,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function recordCapabilityFromPreview(
  preview: LongitudinalClinicalRecordPreviewResponse,
): LongitudinalHttpCapability {
  return preview.data.capability;
}

export function isLongitudinalPreviewEnabled(
  capability: LongitudinalHttpCapability,
): boolean {
  return capability.inLongitudinalScope && capability.supportsPreview;
}

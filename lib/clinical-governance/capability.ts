import type {
  ClinicalGovernanceHttpCapability,
  ClinicalGovernancePreviewResponse,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function governanceCapabilityFromPreview(
  preview: ClinicalGovernancePreviewResponse,
): ClinicalGovernanceHttpCapability {
  return preview.data.capability;
}

export function isClinicalGovernancePreviewEnabled(
  capability: ClinicalGovernanceHttpCapability,
): boolean {
  return capability.inClinicalGovernanceScope && capability.supportsPreview;
}

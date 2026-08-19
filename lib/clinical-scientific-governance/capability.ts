import type {
  ClinicalScientificGovernanceHttpCapability,
  ClinicalScientificGovernancePreviewResponse,
} from "./types";

export function scientificGovernanceCapabilityFromPreview(
  preview: ClinicalScientificGovernancePreviewResponse,
): ClinicalScientificGovernanceHttpCapability {
  return preview.data.capability;
}

export function isClinicalScientificGovernancePreviewEnabled(
  capability: ClinicalScientificGovernanceHttpCapability,
): boolean {
  return (
    capability.inClinicalScientificGovernanceScope && capability.supportsPreview
  );
}

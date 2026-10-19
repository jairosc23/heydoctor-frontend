import type {
  ClinicalEvidenceHttpCapability,
  ClinicalEvidencePreviewResponse,
} from "./types";

export function evidenceCapabilityFromPreview(
  preview: ClinicalEvidencePreviewResponse,
): ClinicalEvidenceHttpCapability {
  return preview.data.capability;
}

export function isClinicalEvidencePreviewEnabled(
  capability: ClinicalEvidenceHttpCapability,
): boolean {
  return capability.inClinicalEvidenceScope && capability.supportsPreview;
}

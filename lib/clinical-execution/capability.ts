import type {
  ClinicalExecutionHttpCapability,
  ClinicalExecutionPreviewResponse,
} from "./types";

export function executionCapabilityFromPreview(
  preview: ClinicalExecutionPreviewResponse,
): ClinicalExecutionHttpCapability {
  return preview.data.capability;
}

export function isClinicalExecutionPreviewEnabled(
  capability: ClinicalExecutionHttpCapability,
): boolean {
  return capability.inClinicalExecutionScope && capability.supportsPreview;
}

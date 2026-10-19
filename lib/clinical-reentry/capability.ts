import type {
  ClinicalReentryHttpCapability,
  ClinicalReentryPreviewResponse,
} from "./types";

export function reentryCapabilityFromPreview(
  preview: ClinicalReentryPreviewResponse,
): ClinicalReentryHttpCapability {
  return preview.data.capability;
}

export function isClinicalReentryPreviewEnabled(
  capability: ClinicalReentryHttpCapability,
): boolean {
  return capability.inClinicalReentryScope && capability.supportsPreview;
}

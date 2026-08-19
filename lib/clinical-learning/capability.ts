import type {
  ClinicalLearningHttpCapability,
  ClinicalLearningPreviewResponse,
} from "./types";

export function learningCapabilityFromPreview(
  preview: ClinicalLearningPreviewResponse,
): ClinicalLearningHttpCapability {
  return preview.data.capability;
}

export function isClinicalLearningPreviewEnabled(
  capability: ClinicalLearningHttpCapability,
): boolean {
  return capability.inClinicalLearningScope && capability.supportsPreview;
}

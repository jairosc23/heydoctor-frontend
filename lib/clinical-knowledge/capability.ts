import type {
  ClinicalKnowledgeHttpCapability,
  ClinicalKnowledgePreviewResponse,
} from "./types";

export function knowledgeCapabilityFromPreview(
  preview: ClinicalKnowledgePreviewResponse,
): ClinicalKnowledgeHttpCapability {
  return preview.data.capability;
}

export function isClinicalKnowledgePreviewEnabled(
  capability: ClinicalKnowledgeHttpCapability,
): boolean {
  return capability.inClinicalKnowledgeScope && capability.supportsPreview;
}

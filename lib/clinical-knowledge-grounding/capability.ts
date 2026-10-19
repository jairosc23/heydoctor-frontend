import type {
  ClinicalKnowledgeGroundingHttpCapability,
  ClinicalKnowledgeGroundingPreviewResponse,
} from "./types";

export function knowledgeGroundingCapabilityFromPreview(
  preview: ClinicalKnowledgeGroundingPreviewResponse,
): ClinicalKnowledgeGroundingHttpCapability {
  return preview.data.capability;
}

export function isClinicalKnowledgeGroundingPreviewEnabled(
  capability: ClinicalKnowledgeGroundingHttpCapability,
): boolean {
  return (
    capability.inClinicalKnowledgeGroundingScope && capability.supportsPreview
  );
}

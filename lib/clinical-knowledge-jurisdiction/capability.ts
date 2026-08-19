import type {
  ClinicalKnowledgeJurisdictionHttpCapability,
  ClinicalKnowledgeJurisdictionPreviewResponse,
} from "./types";

export function knowledgeJurisdictionCapabilityFromPreview(
  preview: ClinicalKnowledgeJurisdictionPreviewResponse,
): ClinicalKnowledgeJurisdictionHttpCapability {
  return preview.data.capability;
}

export function isClinicalKnowledgeJurisdictionPreviewEnabled(
  capability: ClinicalKnowledgeJurisdictionHttpCapability,
): boolean {
  return (
    capability.inClinicalKnowledgeJurisdictionScope && capability.supportsPreview
  );
}

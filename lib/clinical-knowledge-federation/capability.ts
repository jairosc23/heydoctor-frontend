import type {
  ClinicalKnowledgeFederationHttpCapability,
  ClinicalKnowledgeFederationPreviewResponse,
} from "./types";

export function knowledgeFederationCapabilityFromPreview(
  preview: ClinicalKnowledgeFederationPreviewResponse,
): ClinicalKnowledgeFederationHttpCapability {
  return preview.data.capability;
}

export function isClinicalKnowledgeFederationPreviewEnabled(
  capability: ClinicalKnowledgeFederationHttpCapability,
): boolean {
  return (
    capability.inClinicalKnowledgeFederationScope && capability.supportsPreview
  );
}

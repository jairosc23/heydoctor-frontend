import type {
  ClinicalKnowledgeEngineHttpCapability,
  ClinicalKnowledgeEnginePreviewResponse,
} from "./types";

export function knowledgeEngineCapabilityFromPreview(
  preview: ClinicalKnowledgeEnginePreviewResponse,
): ClinicalKnowledgeEngineHttpCapability {
  return preview.data.capability;
}

export function isClinicalKnowledgeEnginePreviewEnabled(
  capability: ClinicalKnowledgeEngineHttpCapability,
): boolean {
  return (
    capability.inClinicalKnowledgeEngineScope && capability.supportsPreview
  );
}

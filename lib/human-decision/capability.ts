import type {
  HumanDecisionHttpCapability,
  HumanDecisionPreviewResponse,
} from "./types";

export function decisionCapabilityFromPreview(
  preview: HumanDecisionPreviewResponse,
): HumanDecisionHttpCapability {
  return preview.data.capability;
}

export function isHumanDecisionPreviewEnabled(
  capability: HumanDecisionHttpCapability,
): boolean {
  return capability.inHumanDecisionScope && capability.supportsPreview;
}

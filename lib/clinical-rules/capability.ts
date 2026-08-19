import type {
  ClinicalRuleEvaluationPreviewResponse,
  ClinicalRuleHttpCapability,
} from "./types";

/**
 * Capability tal como llega en el preview HTTP.
 * No hay catalogo local ni reglas de Gate en el frontend.
 */
export function ruleCapabilityFromPreview(
  preview: ClinicalRuleEvaluationPreviewResponse,
): ClinicalRuleHttpCapability {
  return preview.data.capability;
}

export function isClinicalRulePreviewEnabled(
  capability: ClinicalRuleHttpCapability,
): boolean {
  return capability.inClinicalRulesScope && capability.supportsPreview;
}

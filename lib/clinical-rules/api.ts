import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isClinicalRulePreviewEnabled,
  ruleCapabilityFromPreview,
} from "./capability";
import {
  CLINICAL_RULE_TYPES,
  type ClinicalRuleEvaluationPreviewResponse,
  type ClinicalRuleHttpCapability,
  type ClinicalRuleType,
} from "./types";

export type ClinicalRuleListItem = {
  ruleType: ClinicalRuleType;
  preview: ClinicalRuleEvaluationPreviewResponse;
  capability: ClinicalRuleHttpCapability;
};

export function previewPath(
  ruleType: ClinicalRuleType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-rules/${ruleType}/preview?${query.toString()}`;
}

export async function previewClinicalRuleEvaluation(
  ruleType: ClinicalRuleType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalRuleEvaluationPreviewResponse> {
  return heydoctorApi.get<ClinicalRuleEvaluationPreviewResponse>(
    previewPath(ruleType, consultationId, previewId),
  );
}

export async function listEnabledClinicalRuleTypes(
  consultationId: string,
): Promise<ClinicalRuleListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_RULE_TYPES.map(async (ruleType) => {
      const preview = await previewClinicalRuleEvaluation(
        ruleType,
        consultationId,
      );
      const capability = ruleCapabilityFromPreview(preview);
      if (!isClinicalRulePreviewEnabled(capability)) {
        return null;
      }
      return {
        ruleType,
        preview,
        capability,
      } satisfies ClinicalRuleListItem;
    }),
  );

  const items: ClinicalRuleListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const outcome of outcomes) {
    if (outcome.status === "fulfilled") {
      if (outcome.value) items.push(outcome.value);
      continue;
    }
    const error = outcome.reason;
    if (error instanceof ApiError && error.status === 403) {
      continue;
    }
    if (error instanceof ApiError && error.status === 404) {
      missingConsultation = true;
      continue;
    }
    errors.push(error instanceof Error ? error : new Error(String(error)));
  }

  if (missingConsultation && items.length === 0) {
    throw new ApiError("Consulta no encontrada", 404);
  }
  if (items.length === 0 && errors.length > 0) {
    throw errors[0];
  }
  return items;
}

import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isClinicalRecommendationPreviewEnabled,
  recommendationCapabilityFromPreview,
} from "./capability";
import {
  CLINICAL_RECOMMENDATION_TYPES,
  type ClinicalRecommendationHttpCapability,
  type ClinicalRecommendationPreviewResponse,
  type ClinicalRecommendationType,
} from "./types";

export type ClinicalRecommendationListItem = {
  recommendationType: ClinicalRecommendationType;
  preview: ClinicalRecommendationPreviewResponse;
  capability: ClinicalRecommendationHttpCapability;
};

export function previewPath(
  recommendationType: ClinicalRecommendationType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-recommendation/${recommendationType}/preview?${query.toString()}`;
}

export async function previewClinicalRecommendation(
  recommendationType: ClinicalRecommendationType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalRecommendationPreviewResponse> {
  return heydoctorApi.get<ClinicalRecommendationPreviewResponse>(
    previewPath(recommendationType, consultationId, previewId),
  );
}

export async function listEnabledClinicalRecommendationTypes(
  consultationId: string,
): Promise<ClinicalRecommendationListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_RECOMMENDATION_TYPES.map(async (recommendationType) => {
      const preview = await previewClinicalRecommendation(
        recommendationType,
        consultationId,
      );
      const capability = recommendationCapabilityFromPreview(preview);
      if (!isClinicalRecommendationPreviewEnabled(capability)) {
        return null;
      }
      return {
        recommendationType,
        preview,
        capability,
      } satisfies ClinicalRecommendationListItem;
    }),
  );

  const items: ClinicalRecommendationListItem[] = [];
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

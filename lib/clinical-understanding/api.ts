import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isClinicalUnderstandingPreviewEnabled,
  understandingCapabilityFromPreview,
} from "./capability";
import {
  CLINICAL_UNDERSTANDING_TYPES,
  type ClinicalUnderstandingHttpCapability,
  type ClinicalUnderstandingPreviewResponse,
  type ClinicalUnderstandingType,
} from "./types";

export type ClinicalUnderstandingListItem = {
  understandingType: ClinicalUnderstandingType;
  preview: ClinicalUnderstandingPreviewResponse;
  capability: ClinicalUnderstandingHttpCapability;
};

export function previewPath(
  understandingType: ClinicalUnderstandingType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-understanding/${understandingType}/preview?${query.toString()}`;
}

export async function previewClinicalUnderstanding(
  understandingType: ClinicalUnderstandingType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalUnderstandingPreviewResponse> {
  return heydoctorApi.get<ClinicalUnderstandingPreviewResponse>(
    previewPath(understandingType, consultationId, previewId),
  );
}

export async function listEnabledClinicalUnderstandingTypes(
  consultationId: string,
): Promise<ClinicalUnderstandingListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_UNDERSTANDING_TYPES.map(async (understandingType) => {
      const preview = await previewClinicalUnderstanding(
        understandingType,
        consultationId,
      );
      const capability = understandingCapabilityFromPreview(preview);
      if (!isClinicalUnderstandingPreviewEnabled(capability)) {
        return null;
      }
      return {
        understandingType,
        preview,
        capability,
      } satisfies ClinicalUnderstandingListItem;
    }),
  );

  const items: ClinicalUnderstandingListItem[] = [];
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

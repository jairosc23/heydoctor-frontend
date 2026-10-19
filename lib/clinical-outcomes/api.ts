import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isClinicalOutcomePreviewEnabled,
  outcomeCapabilityFromPreview,
} from "./capability";
import {
  CLINICAL_OUTCOME_TYPES,
  type ClinicalOutcomeHttpCapability,
  type ClinicalOutcomePreviewResponse,
  type ClinicalOutcomeType,
} from "./types";

export type ClinicalOutcomeListItem = {
  outcomeType: ClinicalOutcomeType;
  preview: ClinicalOutcomePreviewResponse;
  capability: ClinicalOutcomeHttpCapability;
};

export function previewPath(
  outcomeType: ClinicalOutcomeType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-outcomes/${outcomeType}/preview?${query.toString()}`;
}

export async function previewClinicalOutcome(
  outcomeType: ClinicalOutcomeType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalOutcomePreviewResponse> {
  return heydoctorApi.get<ClinicalOutcomePreviewResponse>(
    previewPath(outcomeType, consultationId, previewId),
  );
}

export async function listEnabledClinicalOutcomeTypes(
  consultationId: string,
): Promise<ClinicalOutcomeListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_OUTCOME_TYPES.map(async (outcomeType) => {
      const preview = await previewClinicalOutcome(outcomeType, consultationId);
      const capability = outcomeCapabilityFromPreview(preview);
      if (!isClinicalOutcomePreviewEnabled(capability)) {
        return null;
      }
      return {
        outcomeType,
        preview,
        capability,
      } satisfies ClinicalOutcomeListItem;
    }),
  );

  const items: ClinicalOutcomeListItem[] = [];
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

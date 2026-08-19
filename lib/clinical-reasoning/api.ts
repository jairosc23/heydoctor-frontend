import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isClinicalReasoningPreviewEnabled,
  reasoningCapabilityFromPreview,
} from "./capability";
import {
  CLINICAL_REASONING_TYPES,
  type ClinicalReasoningHttpCapability,
  type ClinicalReasoningPreviewResponse,
  type ClinicalReasoningType,
} from "./types";

export type ClinicalReasoningListItem = {
  reasoningType: ClinicalReasoningType;
  preview: ClinicalReasoningPreviewResponse;
  capability: ClinicalReasoningHttpCapability;
};

export function previewPath(
  reasoningType: ClinicalReasoningType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-reasoning/${reasoningType}/preview?${query.toString()}`;
}

export async function previewClinicalReasoning(
  reasoningType: ClinicalReasoningType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalReasoningPreviewResponse> {
  return heydoctorApi.get<ClinicalReasoningPreviewResponse>(
    previewPath(reasoningType, consultationId, previewId),
  );
}

export async function listEnabledClinicalReasoningTypes(
  consultationId: string,
): Promise<ClinicalReasoningListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_REASONING_TYPES.map(async (reasoningType) => {
      const preview = await previewClinicalReasoning(
        reasoningType,
        consultationId,
      );
      const capability = reasoningCapabilityFromPreview(preview);
      if (!isClinicalReasoningPreviewEnabled(capability)) {
        return null;
      }
      return {
        reasoningType,
        preview,
        capability,
      } satisfies ClinicalReasoningListItem;
    }),
  );

  const items: ClinicalReasoningListItem[] = [];
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

import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  learningCapabilityFromPreview,
  isClinicalLearningPreviewEnabled,
} from "./capability";
import {
  CLINICAL_LEARNING_TYPES,
  type ClinicalLearningHttpCapability,
  type ClinicalLearningPreviewResponse,
  type ClinicalLearningType,
} from "./types";

export type ClinicalLearningListItem = {
  learningType: ClinicalLearningType;
  preview: ClinicalLearningPreviewResponse;
  capability: ClinicalLearningHttpCapability;
};

export function previewPath(
  learningType: ClinicalLearningType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-learning/${learningType}/preview?${query.toString()}`;
}

export async function previewClinicalLearning(
  learningType: ClinicalLearningType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalLearningPreviewResponse> {
  return heydoctorApi.get<ClinicalLearningPreviewResponse>(
    previewPath(learningType, consultationId, previewId),
  );
}

export async function listEnabledClinicalLearningTypes(
  consultationId: string,
): Promise<ClinicalLearningListItem[]> {
  const learnings = await Promise.allSettled(
    CLINICAL_LEARNING_TYPES.map(async (learningType) => {
      const preview = await previewClinicalLearning(learningType, consultationId);
      const capability = learningCapabilityFromPreview(preview);
      if (!isClinicalLearningPreviewEnabled(capability)) {
        return null;
      }
      return { learningType, preview, capability } satisfies ClinicalLearningListItem;
    }),
  );

  const items: ClinicalLearningListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const learning of learnings) {
    if (learning.status === "fulfilled") {
      if (learning.value) items.push(learning.value);
      continue;
    }
    const error = learning.reason;
    if (error instanceof ApiError && error.status === 403) continue;
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

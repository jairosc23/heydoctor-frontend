import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  knowledgeGroundingCapabilityFromPreview,
  isClinicalKnowledgeGroundingPreviewEnabled,
} from "./capability";
import {
  CLINICAL_KNOWLEDGE_GROUNDING_TYPES,
  type ClinicalKnowledgeGroundingHttpCapability,
  type ClinicalKnowledgeGroundingPreviewResponse,
  type ClinicalKnowledgeGroundingType,
} from "./types";

export type ClinicalKnowledgeGroundingListItem = {
  groundingType: ClinicalKnowledgeGroundingType;
  preview: ClinicalKnowledgeGroundingPreviewResponse;
  capability: ClinicalKnowledgeGroundingHttpCapability;
};

export function previewPath(
  groundingType: ClinicalKnowledgeGroundingType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-knowledge-grounding/${groundingType}/preview?${query.toString()}`;
}

export async function previewClinicalKnowledgeGrounding(
  groundingType: ClinicalKnowledgeGroundingType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalKnowledgeGroundingPreviewResponse> {
  return heydoctorApi.get<ClinicalKnowledgeGroundingPreviewResponse>(
    previewPath(groundingType, consultationId, previewId),
  );
}

export async function listEnabledClinicalKnowledgeGroundingTypes(
  consultationId: string,
): Promise<ClinicalKnowledgeGroundingListItem[]> {
  const standings = await Promise.allSettled(
    CLINICAL_KNOWLEDGE_GROUNDING_TYPES.map(async (groundingType) => {
      const preview = await previewClinicalKnowledgeGrounding(
        groundingType,
        consultationId,
      );
      const capability = knowledgeGroundingCapabilityFromPreview(preview);
      if (!isClinicalKnowledgeGroundingPreviewEnabled(capability)) {
        return null;
      }
      return { groundingType, preview, capability } satisfies ClinicalKnowledgeGroundingListItem;
    }),
  );

  const items: ClinicalKnowledgeGroundingListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const standing of standings) {
    if (standing.status === "fulfilled") {
      if (standing.value) items.push(standing.value);
      continue;
    }
    const error = standing.reason;
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

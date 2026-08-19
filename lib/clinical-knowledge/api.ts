import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  knowledgeCapabilityFromPreview,
  isClinicalKnowledgePreviewEnabled,
} from "./capability";
import {
  CLINICAL_KNOWLEDGE_TYPES,
  type ClinicalKnowledgeHttpCapability,
  type ClinicalKnowledgePreviewResponse,
  type ClinicalKnowledgeType,
} from "./types";

export type ClinicalKnowledgeListItem = {
  knowledgeType: ClinicalKnowledgeType;
  preview: ClinicalKnowledgePreviewResponse;
  capability: ClinicalKnowledgeHttpCapability;
};

export function previewPath(
  knowledgeType: ClinicalKnowledgeType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-knowledge/${knowledgeType}/preview?${query.toString()}`;
}

export async function previewClinicalKnowledge(
  knowledgeType: ClinicalKnowledgeType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalKnowledgePreviewResponse> {
  return heydoctorApi.get<ClinicalKnowledgePreviewResponse>(
    previewPath(knowledgeType, consultationId, previewId),
  );
}

export async function listEnabledClinicalKnowledgeTypes(
  consultationId: string,
): Promise<ClinicalKnowledgeListItem[]> {
  const knowledges = await Promise.allSettled(
    CLINICAL_KNOWLEDGE_TYPES.map(async (knowledgeType) => {
      const preview = await previewClinicalKnowledge(knowledgeType, consultationId);
      const capability = knowledgeCapabilityFromPreview(preview);
      if (!isClinicalKnowledgePreviewEnabled(capability)) {
        return null;
      }
      return { knowledgeType, preview, capability } satisfies ClinicalKnowledgeListItem;
    }),
  );

  const items: ClinicalKnowledgeListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const knowledge of knowledges) {
    if (knowledge.status === "fulfilled") {
      if (knowledge.value) items.push(knowledge.value);
      continue;
    }
    const error = knowledge.reason;
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

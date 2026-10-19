import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  knowledgeEngineCapabilityFromPreview,
  isClinicalKnowledgeEnginePreviewEnabled,
} from "./capability";
import {
  CLINICAL_KNOWLEDGE_ENGINE_TYPES,
  type ClinicalKnowledgeEngineHttpCapability,
  type ClinicalKnowledgeEnginePreviewResponse,
  type ClinicalKnowledgeEngineType,
} from "./types";

export type ClinicalKnowledgeEngineListItem = {
  adviseType: ClinicalKnowledgeEngineType;
  preview: ClinicalKnowledgeEnginePreviewResponse;
  capability: ClinicalKnowledgeEngineHttpCapability;
};

export function previewPath(
  adviseType: ClinicalKnowledgeEngineType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-knowledge-engine/${adviseType}/preview?${query.toString()}`;
}

export async function previewClinicalKnowledgeEngine(
  adviseType: ClinicalKnowledgeEngineType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalKnowledgeEnginePreviewResponse> {
  return heydoctorApi.get<ClinicalKnowledgeEnginePreviewResponse>(
    previewPath(adviseType, consultationId, previewId),
  );
}

export async function listEnabledClinicalKnowledgeEngineTypes(
  consultationId: string,
): Promise<ClinicalKnowledgeEngineListItem[]> {
  const standings = await Promise.allSettled(
    CLINICAL_KNOWLEDGE_ENGINE_TYPES.map(async (adviseType) => {
      const preview = await previewClinicalKnowledgeEngine(
        adviseType,
        consultationId,
      );
      const capability = knowledgeEngineCapabilityFromPreview(preview);
      if (!isClinicalKnowledgeEnginePreviewEnabled(capability)) {
        return null;
      }
      return { adviseType, preview, capability } satisfies ClinicalKnowledgeEngineListItem;
    }),
  );

  const items: ClinicalKnowledgeEngineListItem[] = [];
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

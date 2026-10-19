import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  knowledgeJurisdictionCapabilityFromPreview,
  isClinicalKnowledgeJurisdictionPreviewEnabled,
} from "./capability";
import {
  CLINICAL_KNOWLEDGE_JURISDICTION_TYPES,
  type ClinicalKnowledgeJurisdictionHttpCapability,
  type ClinicalKnowledgeJurisdictionPreviewResponse,
  type ClinicalKnowledgeJurisdictionType,
} from "./types";

export type ClinicalKnowledgeJurisdictionListItem = {
  jurisdictionType: ClinicalKnowledgeJurisdictionType;
  preview: ClinicalKnowledgeJurisdictionPreviewResponse;
  capability: ClinicalKnowledgeJurisdictionHttpCapability;
};

export function previewPath(
  jurisdictionType: ClinicalKnowledgeJurisdictionType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-knowledge-jurisdiction/${jurisdictionType}/preview?${query.toString()}`;
}

export async function previewClinicalKnowledgeJurisdiction(
  jurisdictionType: ClinicalKnowledgeJurisdictionType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalKnowledgeJurisdictionPreviewResponse> {
  return heydoctorApi.get<ClinicalKnowledgeJurisdictionPreviewResponse>(
    previewPath(jurisdictionType, consultationId, previewId),
  );
}

export async function listEnabledClinicalKnowledgeJurisdictionTypes(
  consultationId: string,
): Promise<ClinicalKnowledgeJurisdictionListItem[]> {
  const standings = await Promise.allSettled(
    CLINICAL_KNOWLEDGE_JURISDICTION_TYPES.map(async (jurisdictionType) => {
      const preview = await previewClinicalKnowledgeJurisdiction(
        jurisdictionType,
        consultationId,
      );
      const capability = knowledgeJurisdictionCapabilityFromPreview(preview);
      if (!isClinicalKnowledgeJurisdictionPreviewEnabled(capability)) {
        return null;
      }
      return { jurisdictionType, preview, capability } satisfies ClinicalKnowledgeJurisdictionListItem;
    }),
  );

  const items: ClinicalKnowledgeJurisdictionListItem[] = [];
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

import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  knowledgeFederationCapabilityFromPreview,
  isClinicalKnowledgeFederationPreviewEnabled,
} from "./capability";
import {
  CLINICAL_KNOWLEDGE_FEDERATION_TYPES,
  type ClinicalKnowledgeFederationHttpCapability,
  type ClinicalKnowledgeFederationPreviewResponse,
  type ClinicalKnowledgeFederationType,
} from "./types";

export type ClinicalKnowledgeFederationListItem = {
  federationType: ClinicalKnowledgeFederationType;
  preview: ClinicalKnowledgeFederationPreviewResponse;
  capability: ClinicalKnowledgeFederationHttpCapability;
};

export function previewPath(
  federationType: ClinicalKnowledgeFederationType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-knowledge-federation/${federationType}/preview?${query.toString()}`;
}

export async function previewClinicalKnowledgeFederation(
  federationType: ClinicalKnowledgeFederationType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalKnowledgeFederationPreviewResponse> {
  return heydoctorApi.get<ClinicalKnowledgeFederationPreviewResponse>(
    previewPath(federationType, consultationId, previewId),
  );
}

export async function listEnabledClinicalKnowledgeFederationTypes(
  consultationId: string,
): Promise<ClinicalKnowledgeFederationListItem[]> {
  const standings = await Promise.allSettled(
    CLINICAL_KNOWLEDGE_FEDERATION_TYPES.map(async (federationType) => {
      const preview = await previewClinicalKnowledgeFederation(
        federationType,
        consultationId,
      );
      const capability = knowledgeFederationCapabilityFromPreview(preview);
      if (!isClinicalKnowledgeFederationPreviewEnabled(capability)) {
        return null;
      }
      return { federationType, preview, capability } satisfies ClinicalKnowledgeFederationListItem;
    }),
  );

  const items: ClinicalKnowledgeFederationListItem[] = [];
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

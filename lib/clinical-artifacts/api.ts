import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  artifactCapabilityFromPreview,
  isArtifactPreviewEnabled,
} from "./capability";
import {
  CLINICAL_ARTIFACT_TYPES,
  type ClinicalArtifactHttpCapability,
  type ClinicalArtifactPreviewResponse,
  type ClinicalArtifactType,
} from "./types";

export type ClinicalArtifactListItem = {
  artifactType: ClinicalArtifactType;
  preview: ClinicalArtifactPreviewResponse;
  capability: ClinicalArtifactHttpCapability;
};

export function previewPath(
  artifactType: ClinicalArtifactType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-artifacts/${artifactType}/preview?${query.toString()}`;
}

export async function previewClinicalArtifact(
  artifactType: ClinicalArtifactType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalArtifactPreviewResponse> {
  return heydoctorApi.get<ClinicalArtifactPreviewResponse>(
    previewPath(artifactType, consultationId, previewId),
  );
}

export async function listEnabledClinicalArtifacts(
  consultationId: string,
): Promise<ClinicalArtifactListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_ARTIFACT_TYPES.map(async (artifactType) => {
      const preview = await previewClinicalArtifact(artifactType, consultationId);
      const capability = artifactCapabilityFromPreview(preview);
      if (!isArtifactPreviewEnabled(capability)) {
        return null;
      }
      return {
        artifactType,
        preview,
        capability,
      } satisfies ClinicalArtifactListItem;
    }),
  );

  const items: ClinicalArtifactListItem[] = [];
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

import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  scientificGovernanceCapabilityFromPreview,
  isClinicalScientificGovernancePreviewEnabled,
} from "./capability";
import {
  CLINICAL_SCIENTIFIC_GOVERNANCE_TYPES,
  type ClinicalScientificGovernanceHttpCapability,
  type ClinicalScientificGovernancePreviewResponse,
  type ClinicalScientificGovernanceType,
} from "./types";

export type ClinicalScientificGovernanceListItem = {
  scientificType: ClinicalScientificGovernanceType;
  preview: ClinicalScientificGovernancePreviewResponse;
  capability: ClinicalScientificGovernanceHttpCapability;
};

export function previewPath(
  scientificType: ClinicalScientificGovernanceType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-scientific-governance/${scientificType}/preview?${query.toString()}`;
}

export async function previewClinicalScientificGovernance(
  scientificType: ClinicalScientificGovernanceType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalScientificGovernancePreviewResponse> {
  return heydoctorApi.get<ClinicalScientificGovernancePreviewResponse>(
    previewPath(scientificType, consultationId, previewId),
  );
}

export async function listEnabledClinicalScientificGovernanceTypes(
  consultationId: string,
): Promise<ClinicalScientificGovernanceListItem[]> {
  const standings = await Promise.allSettled(
    CLINICAL_SCIENTIFIC_GOVERNANCE_TYPES.map(async (scientificType) => {
      const preview = await previewClinicalScientificGovernance(
        scientificType,
        consultationId,
      );
      const capability = scientificGovernanceCapabilityFromPreview(preview);
      if (!isClinicalScientificGovernancePreviewEnabled(capability)) {
        return null;
      }
      return { scientificType, preview, capability } satisfies ClinicalScientificGovernanceListItem;
    }),
  );

  const items: ClinicalScientificGovernanceListItem[] = [];
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

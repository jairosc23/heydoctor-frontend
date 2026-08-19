import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  governanceCapabilityFromPreview,
  isClinicalGovernancePreviewEnabled,
} from "./capability";
import {
  CLINICAL_GOVERNANCE_TYPES,
  type ClinicalGovernanceHttpCapability,
  type ClinicalGovernancePreviewResponse,
  type ClinicalGovernanceType,
} from "./types";

export type ClinicalGovernanceListItem = {
  governanceType: ClinicalGovernanceType;
  preview: ClinicalGovernancePreviewResponse;
  capability: ClinicalGovernanceHttpCapability;
};

export function previewPath(
  governanceType: ClinicalGovernanceType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-governance/${governanceType}/preview?${query.toString()}`;
}

export async function previewClinicalGovernance(
  governanceType: ClinicalGovernanceType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalGovernancePreviewResponse> {
  return heydoctorApi.get<ClinicalGovernancePreviewResponse>(
    previewPath(governanceType, consultationId, previewId),
  );
}

export async function listEnabledClinicalGovernanceTypes(
  consultationId: string,
): Promise<ClinicalGovernanceListItem[]> {
  const governances = await Promise.allSettled(
    CLINICAL_GOVERNANCE_TYPES.map(async (governanceType) => {
      const preview = await previewClinicalGovernance(
        governanceType,
        consultationId,
      );
      const capability = governanceCapabilityFromPreview(preview);
      if (!isClinicalGovernancePreviewEnabled(capability)) {
        return null;
      }
      return {
        governanceType,
        preview,
        capability,
      } satisfies ClinicalGovernanceListItem;
    }),
  );

  const items: ClinicalGovernanceListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const governance of governances) {
    if (governance.status === "fulfilled") {
      if (governance.value) items.push(governance.value);
      continue;
    }
    const error = governance.reason;
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

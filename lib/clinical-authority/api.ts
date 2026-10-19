import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  authorityCapabilityFromPreview,
  isAuthorityPreviewEnabled,
} from "./capability";
import {
  CLINICAL_AUTHORITY_ACT_CLASSES,
  type ClinicalAuthorityActClass,
  type ClinicalAuthorityHttpCapability,
  type ClinicalAuthorityPreviewResponse,
} from "./types";

export type ClinicalAuthorityListItem = {
  actClass: ClinicalAuthorityActClass;
  preview: ClinicalAuthorityPreviewResponse;
  capability: ClinicalAuthorityHttpCapability;
};

export function previewPath(
  actClass: ClinicalAuthorityActClass,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-authority/${actClass}/preview?${query.toString()}`;
}

export async function previewClinicalAuthority(
  actClass: ClinicalAuthorityActClass,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalAuthorityPreviewResponse> {
  return heydoctorApi.get<ClinicalAuthorityPreviewResponse>(
    previewPath(actClass, consultationId, previewId),
  );
}

export async function listEnabledClinicalAuthorityActs(
  consultationId: string,
): Promise<ClinicalAuthorityListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_AUTHORITY_ACT_CLASSES.map(async (actClass) => {
      const preview = await previewClinicalAuthority(actClass, consultationId);
      const capability = authorityCapabilityFromPreview(preview);
      if (!isAuthorityPreviewEnabled(capability)) {
        return null;
      }
      return {
        actClass,
        preview,
        capability,
      } satisfies ClinicalAuthorityListItem;
    }),
  );

  const items: ClinicalAuthorityListItem[] = [];
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

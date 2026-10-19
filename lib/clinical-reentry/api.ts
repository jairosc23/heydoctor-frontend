import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  reentryCapabilityFromPreview,
  isClinicalReentryPreviewEnabled,
} from "./capability";
import {
  CLINICAL_REENTRY_TYPES,
  type ClinicalReentryHttpCapability,
  type ClinicalReentryPreviewResponse,
  type ClinicalReentryType,
} from "./types";

export type ClinicalReentryListItem = {
  reentryType: ClinicalReentryType;
  preview: ClinicalReentryPreviewResponse;
  capability: ClinicalReentryHttpCapability;
};

export function previewPath(
  reentryType: ClinicalReentryType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-reentry/${reentryType}/preview?${query.toString()}`;
}

export async function previewClinicalReentry(
  reentryType: ClinicalReentryType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalReentryPreviewResponse> {
  return heydoctorApi.get<ClinicalReentryPreviewResponse>(
    previewPath(reentryType, consultationId, previewId),
  );
}

export async function listEnabledClinicalReentryTypes(
  consultationId: string,
): Promise<ClinicalReentryListItem[]> {
  const reentries = await Promise.allSettled(
    CLINICAL_REENTRY_TYPES.map(async (reentryType) => {
      const preview = await previewClinicalReentry(reentryType, consultationId);
      const capability = reentryCapabilityFromPreview(preview);
      if (!isClinicalReentryPreviewEnabled(capability)) {
        return null;
      }
      return { reentryType, preview, capability } satisfies ClinicalReentryListItem;
    }),
  );

  const items: ClinicalReentryListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const reentry of reentries) {
    if (reentry.status === "fulfilled") {
      if (reentry.value) items.push(reentry.value);
      continue;
    }
    const error = reentry.reason;
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

import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isLongitudinalPreviewEnabled,
  recordCapabilityFromPreview,
} from "./capability";
import {
  LONGITUDINAL_RECORD_TYPES,
  type LongitudinalClinicalRecordPreviewResponse,
  type LongitudinalHttpCapability,
  type LongitudinalRecordType,
} from "./types";

export type LongitudinalRecordListItem = {
  recordType: LongitudinalRecordType;
  preview: LongitudinalClinicalRecordPreviewResponse;
  capability: LongitudinalHttpCapability;
};

export function previewPath(
  recordType: LongitudinalRecordType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/longitudinal-records/${recordType}/preview?${query.toString()}`;
}

export async function previewLongitudinalClinicalRecord(
  recordType: LongitudinalRecordType,
  consultationId: string,
  previewId?: string,
): Promise<LongitudinalClinicalRecordPreviewResponse> {
  return heydoctorApi.get<LongitudinalClinicalRecordPreviewResponse>(
    previewPath(recordType, consultationId, previewId),
  );
}

export async function listEnabledLongitudinalRecordTypes(
  consultationId: string,
): Promise<LongitudinalRecordListItem[]> {
  const outcomes = await Promise.allSettled(
    LONGITUDINAL_RECORD_TYPES.map(async (recordType) => {
      const preview = await previewLongitudinalClinicalRecord(
        recordType,
        consultationId,
      );
      const capability = recordCapabilityFromPreview(preview);
      if (!isLongitudinalPreviewEnabled(capability)) {
        return null;
      }
      return {
        recordType,
        preview,
        capability,
      } satisfies LongitudinalRecordListItem;
    }),
  );

  const items: LongitudinalRecordListItem[] = [];
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

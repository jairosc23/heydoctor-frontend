import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  isOrderPreviewEnabled,
  orderCapabilityFromPreview,
} from "./capability";
import {
  CLINICAL_ORDER_ENGINE_TYPES,
  type ClinicalOrderEngineType,
  type ClinicalOrderHttpCapability,
  type ClinicalOrderPreviewResponse,
} from "./types";

export type ClinicalOrderListItem = {
  type: ClinicalOrderEngineType;
  preview: ClinicalOrderPreviewResponse;
  capability: ClinicalOrderHttpCapability;
};

export function previewPath(
  type: ClinicalOrderEngineType,
  consultationId: string,
  orderId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (orderId) query.set("orderId", orderId);
  return `/clinical-orders/${type}/preview?${query.toString()}`;
}

export async function previewClinicalOrder(
  type: ClinicalOrderEngineType,
  consultationId: string,
  orderId?: string,
): Promise<ClinicalOrderPreviewResponse> {
  return heydoctorApi.get<ClinicalOrderPreviewResponse>(
    previewPath(type, consultationId, orderId),
  );
}

export async function listEnabledClinicalOrders(
  consultationId: string,
): Promise<ClinicalOrderListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_ORDER_ENGINE_TYPES.map(async (type) => {
      const preview = await previewClinicalOrder(type, consultationId);
      const capability = orderCapabilityFromPreview(preview);
      if (!isOrderPreviewEnabled(capability)) {
        return null;
      }
      return { type, preview, capability } satisfies ClinicalOrderListItem;
    }),
  );

  const items: ClinicalOrderListItem[] = [];
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

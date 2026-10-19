import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  executionCapabilityFromPreview,
  isClinicalExecutionPreviewEnabled,
} from "./capability";
import {
  CLINICAL_EXECUTION_TYPES,
  type ClinicalExecutionHttpCapability,
  type ClinicalExecutionPreviewResponse,
  type ClinicalExecutionType,
} from "./types";

export type ClinicalExecutionListItem = {
  executionType: ClinicalExecutionType;
  preview: ClinicalExecutionPreviewResponse;
  capability: ClinicalExecutionHttpCapability;
};

export function previewPath(
  executionType: ClinicalExecutionType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-execution/${executionType}/preview?${query.toString()}`;
}

export async function previewClinicalExecution(
  executionType: ClinicalExecutionType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalExecutionPreviewResponse> {
  return heydoctorApi.get<ClinicalExecutionPreviewResponse>(
    previewPath(executionType, consultationId, previewId),
  );
}

export async function listEnabledClinicalExecutionTypes(
  consultationId: string,
): Promise<ClinicalExecutionListItem[]> {
  const executions = await Promise.allSettled(
    CLINICAL_EXECUTION_TYPES.map(async (executionType) => {
      const preview = await previewClinicalExecution(executionType, consultationId);
      const capability = executionCapabilityFromPreview(preview);
      if (!isClinicalExecutionPreviewEnabled(capability)) {
        return null;
      }
      return { executionType, preview, capability } satisfies ClinicalExecutionListItem;
    }),
  );

  const items: ClinicalExecutionListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const execution of executions) {
    if (execution.status === "fulfilled") {
      if (execution.value) items.push(execution.value);
      continue;
    }
    const error = execution.reason;
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

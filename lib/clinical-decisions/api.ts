import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  decisionCapabilityFromPreview,
  isDecisionPreviewEnabled,
} from "./capability";
import {
  CLINICAL_DECISION_ENGINE_TYPES,
  type ClinicalDecisionEngineType,
  type ClinicalDecisionHttpCapability,
  type ClinicalDecisionPreviewResponse,
} from "./types";

export type ClinicalDecisionListItem = {
  type: ClinicalDecisionEngineType;
  preview: ClinicalDecisionPreviewResponse;
  capability: ClinicalDecisionHttpCapability;
};

export function previewPath(
  type: ClinicalDecisionEngineType,
  consultationId: string,
  decisionId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (decisionId) query.set("decisionId", decisionId);
  return `/clinical-decisions/${type}/preview?${query.toString()}`;
}

export async function previewClinicalDecision(
  type: ClinicalDecisionEngineType,
  consultationId: string,
  decisionId?: string,
): Promise<ClinicalDecisionPreviewResponse> {
  return heydoctorApi.get<ClinicalDecisionPreviewResponse>(
    previewPath(type, consultationId, decisionId),
  );
}

export async function listEnabledClinicalDecisions(
  consultationId: string,
): Promise<ClinicalDecisionListItem[]> {
  const outcomes = await Promise.allSettled(
    CLINICAL_DECISION_ENGINE_TYPES.map(async (type) => {
      const preview = await previewClinicalDecision(type, consultationId);
      const capability = decisionCapabilityFromPreview(preview);
      if (!isDecisionPreviewEnabled(capability)) {
        return null;
      }
      return { type, preview, capability } satisfies ClinicalDecisionListItem;
    }),
  );

  const items: ClinicalDecisionListItem[] = [];
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

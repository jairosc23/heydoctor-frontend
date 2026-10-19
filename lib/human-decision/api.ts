import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  decisionCapabilityFromPreview,
  isHumanDecisionPreviewEnabled,
} from "./capability";
import {
  HUMAN_DECISION_TYPES,
  type HumanDecisionHttpCapability,
  type HumanDecisionPreviewResponse,
  type HumanDecisionType,
} from "./types";

export type HumanDecisionListItem = {
  decisionType: HumanDecisionType;
  preview: HumanDecisionPreviewResponse;
  capability: HumanDecisionHttpCapability;
};

export function previewPath(
  decisionType: HumanDecisionType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/human-decision/${decisionType}/preview?${query.toString()}`;
}

export async function previewHumanDecision(
  decisionType: HumanDecisionType,
  consultationId: string,
  previewId?: string,
): Promise<HumanDecisionPreviewResponse> {
  return heydoctorApi.get<HumanDecisionPreviewResponse>(
    previewPath(decisionType, consultationId, previewId),
  );
}

export async function listEnabledHumanDecisionTypes(
  consultationId: string,
): Promise<HumanDecisionListItem[]> {
  const decisions = await Promise.allSettled(
    HUMAN_DECISION_TYPES.map(async (decisionType) => {
      const preview = await previewHumanDecision(decisionType, consultationId);
      const capability = decisionCapabilityFromPreview(preview);
      if (!isHumanDecisionPreviewEnabled(capability)) {
        return null;
      }
      return { decisionType, preview, capability } satisfies HumanDecisionListItem;
    }),
  );

  const items: HumanDecisionListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const decision of decisions) {
    if (decision.status === "fulfilled") {
      if (decision.value) items.push(decision.value);
      continue;
    }
    const error = decision.reason;
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

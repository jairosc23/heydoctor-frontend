import { getMedicalCopilotGovernedClinicalActivationTimeline } from "../../api";
import { mapGovernedClinicalActivationTimelineEnvelope } from "./governed-clinical-activation-timeline-mapper";
import type { GovernedClinicalActivationTimelineResult } from "./governed-clinical-activation-timeline";

export async function getGovernedClinicalActivationTimeline(
  sessionId: string,
): Promise<GovernedClinicalActivationTimelineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationTimeline(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationTimelineEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationTimelineReadAdapter = {
  getGovernedClinicalActivationTimeline: typeof getGovernedClinicalActivationTimeline;
};

export const governedClinicalActivationTimelineReadAdapter: GovernedClinicalActivationTimelineReadAdapter = {
  getGovernedClinicalActivationTimeline,
};

import { getMedicalCopilotGovernedClinicalTimeline } from "../../api";
import { mapGovernedClinicalTimelineEnvelope } from "./governed-clinical-timeline-mapper";
import type { GovernedClinicalTimelineResult } from "./governed-clinical-timeline";

export async function getGovernedClinicalTimeline(
  sessionId: string,
): Promise<GovernedClinicalTimelineResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalTimeline(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalTimelineEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalTimelineReadAdapter = {
  getGovernedClinicalTimeline: typeof getGovernedClinicalTimeline;
};

export const governedClinicalTimelineReadAdapter: GovernedClinicalTimelineReadAdapter = {
  getGovernedClinicalTimeline,
};

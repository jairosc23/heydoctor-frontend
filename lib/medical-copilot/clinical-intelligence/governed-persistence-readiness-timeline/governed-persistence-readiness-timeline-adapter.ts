import { getMedicalCopilotGovernedPersistenceReadinessTimeline } from "../../api";
import { mapGovernedPersistenceReadinessTimelineEnvelope } from "./governed-persistence-readiness-timeline-mapper";
import type { GovernedPersistenceReadinessTimelineResult } from "./governed-persistence-readiness-timeline";

export async function getGovernedPersistenceReadinessTimeline(
  sessionId: string,
): Promise<GovernedPersistenceReadinessTimelineResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceReadinessTimeline(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceReadinessTimelineEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceReadinessTimelineReadAdapter = {
  getGovernedPersistenceReadinessTimeline: typeof getGovernedPersistenceReadinessTimeline;
};

export const governedPersistenceReadinessTimelineReadAdapter: GovernedPersistenceReadinessTimelineReadAdapter = {
  getGovernedPersistenceReadinessTimeline,
};

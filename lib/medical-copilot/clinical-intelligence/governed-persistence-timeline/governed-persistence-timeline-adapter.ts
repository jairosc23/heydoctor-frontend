import { getMedicalCopilotGovernedPersistenceTimeline } from "../../api";
import { mapGovernedPersistenceTimelineEnvelope } from "./governed-persistence-timeline-mapper";
import type { GovernedPersistenceTimelineResult } from "./governed-persistence-timeline";

export async function getGovernedPersistenceTimeline(
  sessionId: string,
): Promise<GovernedPersistenceTimelineResult | null> {
  const envelope = await getMedicalCopilotGovernedPersistenceTimeline(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPersistenceTimelineEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPersistenceTimelineReadAdapter = {
  getGovernedPersistenceTimeline: typeof getGovernedPersistenceTimeline;
};

export const governedPersistenceTimelineReadAdapter: GovernedPersistenceTimelineReadAdapter = {
  getGovernedPersistenceTimeline,
};

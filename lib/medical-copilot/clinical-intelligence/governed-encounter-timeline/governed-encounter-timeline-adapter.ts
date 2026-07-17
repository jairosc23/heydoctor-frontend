import { getMedicalCopilotGovernedEncounterTimeline } from "../../api";
import { mapGovernedEncounterTimelineEnvelope } from "./governed-encounter-timeline-mapper";
import type { GovernedEncounterTimelineResult } from "./governed-encounter-timeline";

export async function getGovernedEncounterTimeline(
  sessionId: string,
): Promise<GovernedEncounterTimelineResult | null> {
  const envelope = await getMedicalCopilotGovernedEncounterTimeline(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedEncounterTimelineEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedEncounterTimelineReadAdapter = {
  getGovernedEncounterTimeline: typeof getGovernedEncounterTimeline;
};

export const governedEncounterTimelineReadAdapter: GovernedEncounterTimelineReadAdapter = {
  getGovernedEncounterTimeline,
};

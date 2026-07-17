import {
  GOVERNED_ENCOUNTER_TIMELINE_GOVERNANCE,
  type GovernedEncounterTimelineComponentKey,
  type GovernedEncounterTimelineComponentPresence,
  type GovernedEncounterTimelineResult,
} from "./governed-encounter-timeline";

const COMPONENT_DEFS: Array<{
  key: GovernedEncounterTimelineComponentKey;
  label: string;
}> = [
  { key: "clinicalTimeline", label: "Clinical Timeline" },
  { key: "encounterSnapshot", label: "Encounter Snapshot" },
];

export function mapGovernedEncounterTimelineEnvelope(
  payload: unknown,
): GovernedEncounterTimelineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalTimeline !== undefined ||
    root.encounterSnapshot !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedEncounterTimelineComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalTimeline: data.clinicalTimeline ?? null,
    encounterSnapshot: data.encounterSnapshot ?? null,
    components,
    governance: { ...GOVERNED_ENCOUNTER_TIMELINE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

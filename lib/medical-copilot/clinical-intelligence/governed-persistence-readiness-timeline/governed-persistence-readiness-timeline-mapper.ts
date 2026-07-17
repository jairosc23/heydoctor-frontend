import {
  GOVERNED_PERSISTENCE_READINESS_TIMELINE_GOVERNANCE,
  type GovernedPersistenceReadinessTimelineComponentKey,
  type GovernedPersistenceReadinessTimelineComponentPresence,
  type GovernedPersistenceReadinessTimelineResult,
} from "./governed-persistence-readiness-timeline";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessTimelineComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessReview", label: "Persistence Readiness Review" },
  { key: "persistenceTimeline", label: "Persistence Timeline" },
];

export function mapGovernedPersistenceReadinessTimelineEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessTimelineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessReview !== undefined ||
    root.persistenceTimeline !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessTimelineComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessReview: data.persistenceReadinessReview ?? null,
    persistenceTimeline: data.persistenceTimeline ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_TIMELINE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

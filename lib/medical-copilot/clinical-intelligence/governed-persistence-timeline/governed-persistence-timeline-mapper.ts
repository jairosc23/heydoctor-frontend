import {
  GOVERNED_PERSISTENCE_TIMELINE_GOVERNANCE,
  type GovernedPersistenceTimelineComponentKey,
  type GovernedPersistenceTimelineComponentPresence,
  type GovernedPersistenceTimelineResult,
} from "./governed-persistence-timeline";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceTimelineComponentKey;
  label: string;
}> = [
  { key: "persistenceReview", label: "Persistence Review" },
  { key: "clinicalActivationTimeline", label: "Clinical Activation Timeline" },
];

export function mapGovernedPersistenceTimelineEnvelope(
  payload: unknown,
): GovernedPersistenceTimelineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReview !== undefined ||
    root.clinicalActivationTimeline !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceTimelineComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReview: data.persistenceReview ?? null,
    clinicalActivationTimeline: data.clinicalActivationTimeline ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_TIMELINE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

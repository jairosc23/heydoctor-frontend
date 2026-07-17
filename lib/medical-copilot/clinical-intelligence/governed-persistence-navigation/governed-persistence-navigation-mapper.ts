import {
  GOVERNED_PERSISTENCE_NAVIGATION_GOVERNANCE,
  type GovernedPersistenceNavigationComponentKey,
  type GovernedPersistenceNavigationComponentPresence,
  type GovernedPersistenceNavigationResult,
} from "./governed-persistence-navigation";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceNavigationComponentKey;
  label: string;
}> = [
  { key: "persistenceTimeline", label: "Persistence Timeline" },
  { key: "clinicalActivationNavigation", label: "Clinical Activation Navigation" },
];

export function mapGovernedPersistenceNavigationEnvelope(
  payload: unknown,
): GovernedPersistenceNavigationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceTimeline !== undefined ||
    root.clinicalActivationNavigation !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceNavigationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceTimeline: data.persistenceTimeline ?? null,
    clinicalActivationNavigation: data.clinicalActivationNavigation ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_NAVIGATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

import {
  GOVERNED_PERSISTENCE_READINESS_DASHBOARD_GOVERNANCE,
  type GovernedPersistenceReadinessDashboardComponentKey,
  type GovernedPersistenceReadinessDashboardComponentPresence,
  type GovernedPersistenceReadinessDashboardResult,
} from "./governed-persistence-readiness-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessDashboardComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessTimeline", label: "Persistence Readiness Timeline" },
  { key: "persistenceDashboard", label: "Persistence Dashboard" },
];

export function mapGovernedPersistenceReadinessDashboardEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessTimeline !== undefined ||
    root.persistenceDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessTimeline: data.persistenceReadinessTimeline ?? null,
    persistenceDashboard: data.persistenceDashboard ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

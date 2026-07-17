import {
  GOVERNED_PERSISTENCE_DASHBOARD_GOVERNANCE,
  type GovernedPersistenceDashboardComponentKey,
  type GovernedPersistenceDashboardComponentPresence,
  type GovernedPersistenceDashboardResult,
} from "./governed-persistence-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceDashboardComponentKey;
  label: string;
}> = [
  { key: "persistenceNavigation", label: "Persistence Navigation" },
  { key: "clinicalActivationDashboard", label: "Clinical Activation Dashboard" },
];

export function mapGovernedPersistenceDashboardEnvelope(
  payload: unknown,
): GovernedPersistenceDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceNavigation !== undefined ||
    root.clinicalActivationDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceNavigation: data.persistenceNavigation ?? null,
    clinicalActivationDashboard: data.clinicalActivationDashboard ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

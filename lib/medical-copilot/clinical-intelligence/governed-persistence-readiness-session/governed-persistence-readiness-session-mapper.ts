import {
  GOVERNED_PERSISTENCE_READINESS_SESSION_GOVERNANCE,
  type GovernedPersistenceReadinessSessionComponentKey,
  type GovernedPersistenceReadinessSessionComponentPresence,
  type GovernedPersistenceReadinessSessionResult,
} from "./governed-persistence-readiness-session";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessSessionComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessDashboard", label: "Persistence Readiness Dashboard" },
  { key: "persistenceSession", label: "Persistence Session" },
];

export function mapGovernedPersistenceReadinessSessionEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessSessionResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessDashboard !== undefined ||
    root.persistenceSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessSessionComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessDashboard: data.persistenceReadinessDashboard ?? null,
    persistenceSession: data.persistenceSession ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_SESSION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

import {
  GOVERNED_PERSISTENCE_READINESS_RUNTIME_GOVERNANCE,
  type GovernedPersistenceReadinessRuntimeComponentKey,
  type GovernedPersistenceReadinessRuntimeComponentPresence,
  type GovernedPersistenceReadinessRuntimeResult,
} from "./governed-persistence-readiness-runtime";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessRuntimeComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessSession", label: "Persistence Readiness Session" },
  { key: "persistenceRuntime", label: "Persistence Runtime" },
];

export function mapGovernedPersistenceReadinessRuntimeEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessRuntimeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessSession !== undefined ||
    root.persistenceRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessRuntimeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessSession: data.persistenceReadinessSession ?? null,
    persistenceRuntime: data.persistenceRuntime ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_RUNTIME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

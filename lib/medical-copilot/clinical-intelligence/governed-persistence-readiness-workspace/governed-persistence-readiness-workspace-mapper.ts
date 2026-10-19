import {
  GOVERNED_PERSISTENCE_READINESS_WORKSPACE_GOVERNANCE,
  type GovernedPersistenceReadinessWorkspaceComponentKey,
  type GovernedPersistenceReadinessWorkspaceComponentPresence,
  type GovernedPersistenceReadinessWorkspaceResult,
} from "./governed-persistence-readiness-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessWorkspaceComponentKey;
  label: string;
}> = [
  { key: "persistencePackage", label: "Persistence Package" },
  { key: "clinicalActivationPackage", label: "Clinical Activation Package" },
];

export function mapGovernedPersistenceReadinessWorkspaceEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistencePackage !== undefined ||
    root.clinicalActivationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistencePackage: data.persistencePackage ?? null,
    clinicalActivationPackage: data.clinicalActivationPackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

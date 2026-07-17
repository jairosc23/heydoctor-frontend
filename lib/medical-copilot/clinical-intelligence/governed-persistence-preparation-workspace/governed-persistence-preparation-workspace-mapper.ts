import {
  GOVERNED_PERSISTENCE_PREPARATION_WORKSPACE_GOVERNANCE,
  type GovernedPersistencePreparationWorkspaceComponentKey,
  type GovernedPersistencePreparationWorkspaceComponentPresence,
  type GovernedPersistencePreparationWorkspaceResult,
} from "./governed-persistence-preparation-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistencePreparationWorkspaceComponentKey;
  label: string;
}> = [
  { key: "clinicalActivationPackage", label: "Clinical Activation Package" },
  { key: "physicianRuntimePackage", label: "Physician Runtime Package" },
];

export function mapGovernedPersistencePreparationWorkspaceEnvelope(
  payload: unknown,
): GovernedPersistencePreparationWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalActivationPackage !== undefined ||
    root.physicianRuntimePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistencePreparationWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalActivationPackage: data.clinicalActivationPackage ?? null,
    physicianRuntimePackage: data.physicianRuntimePackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_PREPARATION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

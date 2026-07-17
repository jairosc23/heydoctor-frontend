import {
  GOVERNED_PERSISTENCE_RUNTIME_GOVERNANCE,
  type GovernedPersistenceRuntimeComponentKey,
  type GovernedPersistenceRuntimeComponentPresence,
  type GovernedPersistenceRuntimeResult,
} from "./governed-persistence-runtime";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceRuntimeComponentKey;
  label: string;
}> = [
  { key: "persistenceSession", label: "Persistence Session" },
  { key: "clinicalActivationRuntime", label: "Clinical Activation Runtime" },
];

export function mapGovernedPersistenceRuntimeEnvelope(
  payload: unknown,
): GovernedPersistenceRuntimeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceSession !== undefined ||
    root.clinicalActivationRuntime !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceRuntimeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceSession: data.persistenceSession ?? null,
    clinicalActivationRuntime: data.clinicalActivationRuntime ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_RUNTIME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

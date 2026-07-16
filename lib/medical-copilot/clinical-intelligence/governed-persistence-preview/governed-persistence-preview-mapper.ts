import {
  GOVERNED_PERSISTENCE_PREVIEW_GOVERNANCE,
  type GovernedPersistencePreviewComponentKey,
  type GovernedPersistencePreviewComponentPresence,
  type GovernedPersistencePreviewResult,
} from "./governed-persistence-preview";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistencePreviewComponentKey;
  label: string;
}> = [
  { key: "persistenceRuntime", label: "Persistence Runtime" },
  { key: "clinicalActivationPackage", label: "Clinical Activation Package" },
];

export function mapGovernedPersistencePreviewEnvelope(
  payload: unknown,
): GovernedPersistencePreviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceRuntime !== undefined ||
    root.clinicalActivationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistencePreviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceRuntime: data.persistenceRuntime ?? null,
    clinicalActivationPackage: data.clinicalActivationPackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_PREVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

import {
  GOVERNED_PERSISTENCE_VALIDATION_GOVERNANCE,
  type GovernedPersistenceValidationComponentKey,
  type GovernedPersistenceValidationComponentPresence,
  type GovernedPersistenceValidationResult,
} from "./governed-persistence-validation";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceValidationComponentKey;
  label: string;
}> = [
  { key: "persistencePreview", label: "Persistence Preview" },
  { key: "physicianRuntimePackage", label: "Physician Runtime Package" },
];

export function mapGovernedPersistenceValidationEnvelope(
  payload: unknown,
): GovernedPersistenceValidationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistencePreview !== undefined ||
    root.physicianRuntimePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceValidationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistencePreview: data.persistencePreview ?? null,
    physicianRuntimePackage: data.physicianRuntimePackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_VALIDATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

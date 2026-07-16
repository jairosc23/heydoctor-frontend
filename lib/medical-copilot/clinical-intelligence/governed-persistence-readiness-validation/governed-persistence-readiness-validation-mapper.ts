import {
  GOVERNED_PERSISTENCE_READINESS_VALIDATION_GOVERNANCE,
  type GovernedPersistenceReadinessValidationComponentKey,
  type GovernedPersistenceReadinessValidationComponentPresence,
  type GovernedPersistenceReadinessValidationResult,
} from "./governed-persistence-readiness-validation";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessValidationComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessPreview", label: "Persistence Readiness Preview" },
  { key: "persistenceValidation", label: "Persistence Validation" },
];

export function mapGovernedPersistenceReadinessValidationEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessValidationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessPreview !== undefined ||
    root.persistenceValidation !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessValidationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessPreview: data.persistenceReadinessPreview ?? null,
    persistenceValidation: data.persistenceValidation ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_VALIDATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

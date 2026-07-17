import {
  GOVERNED_PERSISTENCE_READINESS_CONSOLIDATION_GOVERNANCE,
  type GovernedPersistenceReadinessConsolidationComponentKey,
  type GovernedPersistenceReadinessConsolidationComponentPresence,
  type GovernedPersistenceReadinessConsolidationResult,
} from "./governed-persistence-readiness-consolidation";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessConsolidationComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessValidation", label: "Persistence Readiness Validation" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
];

export function mapGovernedPersistenceReadinessConsolidationEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessConsolidationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessValidation !== undefined ||
    root.clinicalExperiencePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessConsolidationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessValidation: data.persistenceReadinessValidation ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_CONSOLIDATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

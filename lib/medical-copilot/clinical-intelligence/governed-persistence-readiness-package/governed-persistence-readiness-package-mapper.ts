import {
  GOVERNED_PERSISTENCE_READINESS_PACKAGE_GOVERNANCE,
  type GovernedPersistenceReadinessPackageComponentKey,
  type GovernedPersistenceReadinessPackageComponentPresence,
  type GovernedPersistenceReadinessPackageResult,
} from "./governed-persistence-readiness-package";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistenceReadinessPackageComponentKey;
  label: string;
}> = [
  { key: "persistenceReadinessConsolidation", label: "Persistence Readiness Consolidation" },
  { key: "persistencePackage", label: "Persistence Package" },
  { key: "clinicalActivationPackage", label: "Clinical Activation Package" },
  { key: "physicianRuntimePackage", label: "Physician Runtime Package" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
  { key: "documentationPackage", label: "Clinical Documentation Package" },
  { key: "consultationPackage", label: "Consultation Package" },
];

export function mapGovernedPersistenceReadinessPackageEnvelope(
  payload: unknown,
): GovernedPersistenceReadinessPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceReadinessConsolidation !== undefined ||
    root.persistencePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistenceReadinessPackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceReadinessConsolidation: data.persistenceReadinessConsolidation ?? null,
    persistencePackage: data.persistencePackage ?? null,
    clinicalActivationPackage: data.clinicalActivationPackage ?? null,
    physicianRuntimePackage: data.physicianRuntimePackage ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    documentationPackage: data.documentationPackage ?? null,
    consultationPackage: data.consultationPackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_READINESS_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

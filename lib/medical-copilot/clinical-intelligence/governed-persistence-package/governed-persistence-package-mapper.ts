import {
  GOVERNED_PERSISTENCE_PACKAGE_GOVERNANCE,
  type GovernedPersistencePackageComponentKey,
  type GovernedPersistencePackageComponentPresence,
  type GovernedPersistencePackageResult,
} from "./governed-persistence-package";

const COMPONENT_DEFS: Array<{
  key: GovernedPersistencePackageComponentKey;
  label: string;
}> = [
  { key: "persistenceValidation", label: "Persistence Validation" },
  { key: "clinicalActivationPackage", label: "Clinical Activation Package" },
  { key: "physicianRuntimePackage", label: "Physician Runtime Package" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "consultationPackage", label: "Consultation Package" },
];

export function mapGovernedPersistencePackageEnvelope(
  payload: unknown,
): GovernedPersistencePackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.persistenceValidation !== undefined ||
    root.clinicalActivationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPersistencePackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    persistenceValidation: data.persistenceValidation ?? null,
    clinicalActivationPackage: data.clinicalActivationPackage ?? null,
    physicianRuntimePackage: data.physicianRuntimePackage ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    documentationPackage: data.documentationPackage ?? null,
    consultationPackage: data.consultationPackage ?? null,
    components,
    governance: { ...GOVERNED_PERSISTENCE_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

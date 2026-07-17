import {
  GOVERNED_CLINICAL_ACTIVATION_PACKAGE_GOVERNANCE,
  type GovernedClinicalActivationPackageComponentKey,
  type GovernedClinicalActivationPackageComponentPresence,
  type GovernedClinicalActivationPackageResult,
} from "./governed-clinical-activation-package";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationPackageComponentKey;
  label: string;
}> = [
  { key: "clinicalActivationRuntime", label: "Clinical Activation Runtime" },
  { key: "physicianRuntimePackage", label: "Physician Runtime Package" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
  { key: "consultationPackage", label: "Consultation Package" },
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedClinicalActivationPackageEnvelope(
  payload: unknown,
): GovernedClinicalActivationPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalActivationRuntime !== undefined ||
    root.physicianRuntimePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationPackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalActivationRuntime: data.clinicalActivationRuntime ?? null,
    physicianRuntimePackage: data.physicianRuntimePackage ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    consultationPackage: data.consultationPackage ?? null,
    documentationPackage: data.documentationPackage ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

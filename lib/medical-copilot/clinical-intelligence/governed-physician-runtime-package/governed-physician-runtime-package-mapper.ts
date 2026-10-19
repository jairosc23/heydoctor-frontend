import {
  GOVERNED_PHYSICIAN_RUNTIME_PACKAGE_GOVERNANCE,
  type GovernedPhysicianRuntimePackageComponentKey,
  type GovernedPhysicianRuntimePackageComponentPresence,
  type GovernedPhysicianRuntimePackageResult,
} from "./governed-physician-runtime-package";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianRuntimePackageComponentKey;
  label: string;
}> = [
  { key: "physicianSession", label: "Physician Session" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "consultationPackage", label: "Consultation Package" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedPhysicianRuntimePackageEnvelope(
  payload: unknown,
): GovernedPhysicianRuntimePackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.physicianSession !== undefined ||
    root.clinicalExperiencePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianRuntimePackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    physicianSession: data.physicianSession ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    documentationPackage: data.documentationPackage ?? null,
    consultationPackage: data.consultationPackage ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_RUNTIME_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

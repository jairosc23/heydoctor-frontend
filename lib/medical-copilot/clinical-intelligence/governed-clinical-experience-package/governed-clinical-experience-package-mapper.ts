import {
  GOVERNED_CLINICAL_EXPERIENCE_PACKAGE_GOVERNANCE,
  type GovernedClinicalExperiencePackageComponentKey,
  type GovernedClinicalExperiencePackageComponentPresence,
  type GovernedClinicalExperiencePackageResult,
} from "./governed-clinical-experience-package";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalExperiencePackageComponentKey;
  label: string;
}> = [
  { key: "consultationExperience", label: "Consultation Experience" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
  { key: "consultationPackage", label: "Consultation Package" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
  { key: "clinicalDashboard", label: "Clinical Dashboard" },
  { key: "physicianDashboard", label: "Physician Dashboard" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedClinicalExperiencePackageEnvelope(
  payload: unknown,
): GovernedClinicalExperiencePackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationExperience !== undefined ||
    root.clinicalWorkspacePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalExperiencePackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationExperience: data.consultationExperience ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    consultationPackage: data.consultationPackage ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    clinicalDashboard: data.clinicalDashboard ?? null,
    physicianDashboard: data.physicianDashboard ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_EXPERIENCE_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

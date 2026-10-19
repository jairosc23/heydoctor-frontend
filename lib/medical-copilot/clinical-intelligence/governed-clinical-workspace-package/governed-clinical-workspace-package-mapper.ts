import {
  GOVERNED_CLINICAL_WORKSPACE_PACKAGE_GOVERNANCE,
  type GovernedClinicalWorkspacePackageComponentKey,
  type GovernedClinicalWorkspacePackageComponentPresence,
  type GovernedClinicalWorkspacePackageResult,
} from "./governed-clinical-workspace-package";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalWorkspacePackageComponentKey;
  label: string;
}> = [
  { key: "clinicalOverview", label: "Clinical Overview" },
  { key: "clinicalWorkspace", label: "Clinical Workspace" },
  { key: "consultationPackage", label: "Consultation Package" },
  { key: "documentationPackage", label: "Documentation Package" },
  { key: "clinicalEncounter", label: "Clinical Encounter" },
  { key: "reviewSession", label: "Review Session" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
];

export function mapGovernedClinicalWorkspacePackageEnvelope(
  payload: unknown,
): GovernedClinicalWorkspacePackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalOverview !== undefined ||
    root.clinicalWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalWorkspacePackageComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalOverview: data.clinicalOverview ?? null,
    clinicalWorkspace: data.clinicalWorkspace ?? null,
    consultationPackage: data.consultationPackage ?? null,
    documentationPackage: data.documentationPackage ?? null,
    clinicalEncounter: data.clinicalEncounter ?? null,
    reviewSession: data.reviewSession ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_WORKSPACE_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

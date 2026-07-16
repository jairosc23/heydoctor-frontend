import {
  GOVERNED_CLINICAL_HOME_GOVERNANCE,
  type GovernedClinicalHomeComponentKey,
  type GovernedClinicalHomeComponentPresence,
  type GovernedClinicalHomeResult,
} from "./governed-clinical-home";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalHomeComponentKey;
  label: string;
}> = [
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
  { key: "clinicalDashboard", label: "Clinical Dashboard" },
];

export function mapGovernedClinicalHomeEnvelope(
  payload: unknown,
): GovernedClinicalHomeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalWorkspacePackage !== undefined ||
    root.clinicalDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalHomeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    clinicalDashboard: data.clinicalDashboard ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_HOME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

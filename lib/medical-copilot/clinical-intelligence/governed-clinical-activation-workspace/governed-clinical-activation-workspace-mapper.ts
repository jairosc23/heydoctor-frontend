import {
  GOVERNED_CLINICAL_ACTIVATION_WORKSPACE_GOVERNANCE,
  type GovernedClinicalActivationWorkspaceComponentKey,
  type GovernedClinicalActivationWorkspaceComponentPresence,
  type GovernedClinicalActivationWorkspaceResult,
} from "./governed-clinical-activation-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationWorkspaceComponentKey;
  label: string;
}> = [
  { key: "physicianRuntimePackage", label: "Physician Runtime Package" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
];

export function mapGovernedClinicalActivationWorkspaceEnvelope(
  payload: unknown,
): GovernedClinicalActivationWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.physicianRuntimePackage !== undefined ||
    root.clinicalExperiencePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    physicianRuntimePackage: data.physicianRuntimePackage ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

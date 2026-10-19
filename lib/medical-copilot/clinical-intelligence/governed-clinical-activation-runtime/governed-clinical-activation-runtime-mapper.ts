import {
  GOVERNED_CLINICAL_ACTIVATION_RUNTIME_GOVERNANCE,
  type GovernedClinicalActivationRuntimeComponentKey,
  type GovernedClinicalActivationRuntimeComponentPresence,
  type GovernedClinicalActivationRuntimeResult,
} from "./governed-clinical-activation-runtime";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationRuntimeComponentKey;
  label: string;
}> = [
  { key: "activationSession", label: "Activation Session" },
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
];

export function mapGovernedClinicalActivationRuntimeEnvelope(
  payload: unknown,
): GovernedClinicalActivationRuntimeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.activationSession !== undefined ||
    root.clinicalExperiencePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationRuntimeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    activationSession: data.activationSession ?? null,
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_RUNTIME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

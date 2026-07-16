import {
  GOVERNED_CLINICAL_ACTIVATION_REVIEW_GOVERNANCE,
  type GovernedClinicalActivationReviewComponentKey,
  type GovernedClinicalActivationReviewComponentPresence,
  type GovernedClinicalActivationReviewResult,
} from "./governed-clinical-activation-review";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationReviewComponentKey;
  label: string;
}> = [
  { key: "activationWorkspace", label: "Activation Workspace" },
  { key: "clinicalReviewPackage", label: "Clinical Review Package" },
];

export function mapGovernedClinicalActivationReviewEnvelope(
  payload: unknown,
): GovernedClinicalActivationReviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.activationWorkspace !== undefined ||
    root.clinicalReviewPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationReviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    activationWorkspace: data.activationWorkspace ?? null,
    clinicalReviewPackage: data.clinicalReviewPackage ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_REVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

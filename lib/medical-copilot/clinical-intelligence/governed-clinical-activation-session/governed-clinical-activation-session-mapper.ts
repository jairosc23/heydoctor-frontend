import {
  GOVERNED_CLINICAL_ACTIVATION_SESSION_GOVERNANCE,
  type GovernedClinicalActivationSessionComponentKey,
  type GovernedClinicalActivationSessionComponentPresence,
  type GovernedClinicalActivationSessionResult,
} from "./governed-clinical-activation-session";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationSessionComponentKey;
  label: string;
}> = [
  { key: "activationDashboard", label: "Activation Dashboard" },
  { key: "reviewSession", label: "Review Session" },
];

export function mapGovernedClinicalActivationSessionEnvelope(
  payload: unknown,
): GovernedClinicalActivationSessionResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.activationDashboard !== undefined ||
    root.reviewSession !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationSessionComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    activationDashboard: data.activationDashboard ?? null,
    reviewSession: data.reviewSession ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_SESSION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

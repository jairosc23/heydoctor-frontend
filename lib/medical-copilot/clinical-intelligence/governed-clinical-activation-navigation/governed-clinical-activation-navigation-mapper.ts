import {
  GOVERNED_CLINICAL_ACTIVATION_NAVIGATION_GOVERNANCE,
  type GovernedClinicalActivationNavigationComponentKey,
  type GovernedClinicalActivationNavigationComponentPresence,
  type GovernedClinicalActivationNavigationResult,
} from "./governed-clinical-activation-navigation";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationNavigationComponentKey;
  label: string;
}> = [
  { key: "activationTimeline", label: "Activation Timeline" },
  { key: "clinicalNavigation", label: "Clinical Navigation" },
];

export function mapGovernedClinicalActivationNavigationEnvelope(
  payload: unknown,
): GovernedClinicalActivationNavigationResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.activationTimeline !== undefined ||
    root.clinicalNavigation !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationNavigationComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    activationTimeline: data.activationTimeline ?? null,
    clinicalNavigation: data.clinicalNavigation ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_NAVIGATION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

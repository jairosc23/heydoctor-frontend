import {
  GOVERNED_CLINICAL_ACTIVATION_TIMELINE_GOVERNANCE,
  type GovernedClinicalActivationTimelineComponentKey,
  type GovernedClinicalActivationTimelineComponentPresence,
  type GovernedClinicalActivationTimelineResult,
} from "./governed-clinical-activation-timeline";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalActivationTimelineComponentKey;
  label: string;
}> = [
  { key: "activationReview", label: "Activation Review" },
  { key: "clinicalTimeline", label: "Clinical Timeline" },
];

export function mapGovernedClinicalActivationTimelineEnvelope(
  payload: unknown,
): GovernedClinicalActivationTimelineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.activationReview !== undefined ||
    root.clinicalTimeline !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalActivationTimelineComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    activationReview: data.activationReview ?? null,
    clinicalTimeline: data.clinicalTimeline ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_ACTIVATION_TIMELINE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

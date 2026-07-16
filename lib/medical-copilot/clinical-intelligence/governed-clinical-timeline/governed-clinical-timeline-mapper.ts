import {
  GOVERNED_CLINICAL_TIMELINE_GOVERNANCE,
  type GovernedClinicalTimelineComponentKey,
  type GovernedClinicalTimelineComponentPresence,
  type GovernedClinicalTimelineResult,
} from "./governed-clinical-timeline";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalTimelineComponentKey;
  label: string;
}> = [
  { key: "consultationHome", label: "Consultation Home" },
  { key: "clinicalOverview", label: "Clinical Overview" },
];

export function mapGovernedClinicalTimelineEnvelope(
  payload: unknown,
): GovernedClinicalTimelineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationHome !== undefined ||
    root.clinicalOverview !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalTimelineComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationHome: data.consultationHome ?? null,
    clinicalOverview: data.clinicalOverview ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_TIMELINE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

import {
  GOVERNED_CLINICAL_EXPERIENCE_GOVERNANCE,
  type GovernedClinicalExperienceComponentKey,
  type GovernedClinicalExperienceComponentPresence,
  type GovernedClinicalExperienceResult,
} from "./governed-clinical-experience";

const COMPONENT_DEFS: Array<{
  key: GovernedClinicalExperienceComponentKey;
  label: string;
}> = [
  { key: "clinicalNavigation", label: "Clinical Navigation" },
  { key: "clinicalSessionDashboard", label: "Clinical Session Dashboard" },
];

export function mapGovernedClinicalExperienceEnvelope(
  payload: unknown,
): GovernedClinicalExperienceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalNavigation !== undefined ||
    root.clinicalSessionDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedClinicalExperienceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalNavigation: data.clinicalNavigation ?? null,
    clinicalSessionDashboard: data.clinicalSessionDashboard ?? null,
    components,
    governance: { ...GOVERNED_CLINICAL_EXPERIENCE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

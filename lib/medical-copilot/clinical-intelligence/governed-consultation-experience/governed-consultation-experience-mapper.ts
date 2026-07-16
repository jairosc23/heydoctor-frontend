import {
  GOVERNED_CONSULTATION_EXPERIENCE_GOVERNANCE,
  type GovernedConsultationExperienceComponentKey,
  type GovernedConsultationExperienceComponentPresence,
  type GovernedConsultationExperienceResult,
} from "./governed-consultation-experience";

const COMPONENT_DEFS: Array<{
  key: GovernedConsultationExperienceComponentKey;
  label: string;
}> = [
  { key: "physicianExperience", label: "Physician Experience" },
  { key: "consultationPackage", label: "Consultation Package" },
];

export function mapGovernedConsultationExperienceEnvelope(
  payload: unknown,
): GovernedConsultationExperienceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.physicianExperience !== undefined ||
    root.consultationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedConsultationExperienceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    physicianExperience: data.physicianExperience ?? null,
    consultationPackage: data.consultationPackage ?? null,
    components,
    governance: { ...GOVERNED_CONSULTATION_EXPERIENCE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

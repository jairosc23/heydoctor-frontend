import {
  GOVERNED_PHYSICIAN_EXPERIENCE_GOVERNANCE,
  type GovernedPhysicianExperienceComponentKey,
  type GovernedPhysicianExperienceComponentPresence,
  type GovernedPhysicianExperienceResult,
} from "./governed-physician-experience";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianExperienceComponentKey;
  label: string;
}> = [
  { key: "clinicalExperience", label: "Clinical Experience" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
];

export function mapGovernedPhysicianExperienceEnvelope(
  payload: unknown,
): GovernedPhysicianExperienceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalExperience !== undefined ||
    root.physicianWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianExperienceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalExperience: data.clinicalExperience ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_EXPERIENCE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

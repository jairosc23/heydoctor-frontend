import {
  GOVERNED_PHYSICIAN_SESSION_GOVERNANCE,
  type GovernedPhysicianSessionComponentKey,
  type GovernedPhysicianSessionComponentPresence,
  type GovernedPhysicianSessionResult,
} from "./governed-physician-session";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianSessionComponentKey;
  label: string;
}> = [
  { key: "clinicalReviewPackage", label: "Clinical Review Package" },
  { key: "physicianDashboard", label: "Physician Dashboard" },
];

export function mapGovernedPhysicianSessionEnvelope(
  payload: unknown,
): GovernedPhysicianSessionResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalReviewPackage !== undefined ||
    root.physicianDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianSessionComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalReviewPackage: data.clinicalReviewPackage ?? null,
    physicianDashboard: data.physicianDashboard ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_SESSION_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

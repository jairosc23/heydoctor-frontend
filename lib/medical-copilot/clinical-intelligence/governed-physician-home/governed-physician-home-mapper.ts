import {
  GOVERNED_PHYSICIAN_HOME_GOVERNANCE,
  type GovernedPhysicianHomeComponentKey,
  type GovernedPhysicianHomeComponentPresence,
  type GovernedPhysicianHomeResult,
} from "./governed-physician-home";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianHomeComponentKey;
  label: string;
}> = [
  { key: "physicianDashboard", label: "Physician Dashboard" },
  { key: "clinicalHome", label: "Clinical Home" },
];

export function mapGovernedPhysicianHomeEnvelope(
  payload: unknown,
): GovernedPhysicianHomeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.physicianDashboard !== undefined ||
    root.clinicalHome !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianHomeComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    physicianDashboard: data.physicianDashboard ?? null,
    clinicalHome: data.clinicalHome ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_HOME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

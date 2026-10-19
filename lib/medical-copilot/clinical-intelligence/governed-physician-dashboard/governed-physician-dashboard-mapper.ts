import {
  GOVERNED_PHYSICIAN_DASHBOARD_GOVERNANCE,
  type GovernedPhysicianDashboardComponentKey,
  type GovernedPhysicianDashboardComponentPresence,
  type GovernedPhysicianDashboardResult,
} from "./governed-physician-dashboard";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianDashboardComponentKey;
  label: string;
}> = [
  { key: "consultationDashboard", label: "Consultation Dashboard" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
];

export function mapGovernedPhysicianDashboardEnvelope(
  payload: unknown,
): GovernedPhysicianDashboardResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.consultationDashboard !== undefined ||
    root.physicianWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianDashboardComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    consultationDashboard: data.consultationDashboard ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_DASHBOARD_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

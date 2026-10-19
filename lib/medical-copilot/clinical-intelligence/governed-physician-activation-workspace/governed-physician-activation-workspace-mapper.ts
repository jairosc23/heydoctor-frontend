import {
  GOVERNED_PHYSICIAN_ACTIVATION_WORKSPACE_GOVERNANCE,
  type GovernedPhysicianActivationWorkspaceComponentKey,
  type GovernedPhysicianActivationWorkspaceComponentPresence,
  type GovernedPhysicianActivationWorkspaceResult,
} from "./governed-physician-activation-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianActivationWorkspaceComponentKey;
  label: string;
}> = [
  { key: "activationNavigation", label: "Activation Navigation" },
  { key: "physicianDashboard", label: "Physician Dashboard" },
];

export function mapGovernedPhysicianActivationWorkspaceEnvelope(
  payload: unknown,
): GovernedPhysicianActivationWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.activationNavigation !== undefined ||
    root.physicianDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianActivationWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    activationNavigation: data.activationNavigation ?? null,
    physicianDashboard: data.physicianDashboard ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_ACTIVATION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

import {
  GOVERNED_PHYSICIAN_INTERACTION_WORKSPACE_GOVERNANCE,
  type GovernedPhysicianInteractionWorkspaceComponentKey,
  type GovernedPhysicianInteractionWorkspaceComponentPresence,
  type GovernedPhysicianInteractionWorkspaceResult,
} from "./governed-physician-interaction-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianInteractionWorkspaceComponentKey;
  label: string;
}> = [
  { key: "clinicalExperiencePackage", label: "Clinical Experience Package" },
  { key: "physicianDashboard", label: "Physician Dashboard" },
];

export function mapGovernedPhysicianInteractionWorkspaceEnvelope(
  payload: unknown,
): GovernedPhysicianInteractionWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalExperiencePackage !== undefined ||
    root.physicianDashboard !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianInteractionWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalExperiencePackage: data.clinicalExperiencePackage ?? null,
    physicianDashboard: data.physicianDashboard ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_INTERACTION_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

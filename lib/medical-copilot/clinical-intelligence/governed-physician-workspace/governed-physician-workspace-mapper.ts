import {
  GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE,
  type GovernedPhysicianWorkspaceComponentKey,
  type GovernedPhysicianWorkspaceComponentPresence,
  type GovernedPhysicianWorkspaceResult,
} from "./governed-physician-workspace";

const COMPONENT_DEFS: Array<{
  key: GovernedPhysicianWorkspaceComponentKey;
  label: string;
}> = [
  { key: "clinicalEncounter", label: "Clinical Encounter" },
  { key: "physicianDecisionWorkspace", label: "Physician Decision Workspace" },
  { key: "reviewSession", label: "Review Session" },
  { key: "clinicalContext", label: "Clinical Context" },
  { key: "clinicalPlan", label: "Clinical Plan" },
];

export function mapGovernedPhysicianWorkspaceEnvelope(
  payload: unknown,
): GovernedPhysicianWorkspaceResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalEncounter !== undefined ||
    root.physicianDecisionWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPhysicianWorkspaceComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalEncounter: data.clinicalEncounter ?? null,
    physicianDecisionWorkspace: data.physicianDecisionWorkspace ?? null,
    reviewSession: data.reviewSession ?? null,
    clinicalContext: data.clinicalContext ?? null,
    clinicalPlan: data.clinicalPlan ?? null,
    components,
    governance: { ...GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

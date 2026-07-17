import {
  GOVERNED_PENDING_ACTIONS_GOVERNANCE,
  type GovernedPendingActionsComponentKey,
  type GovernedPendingActionsComponentPresence,
  type GovernedPendingActionsResult,
} from "./governed-pending-actions";

const COMPONENT_DEFS: Array<{
  key: GovernedPendingActionsComponentKey;
  label: string;
}> = [
  { key: "approvalQueue", label: "Approval Queue" },
  { key: "clinicalWorkspacePackage", label: "Clinical Workspace Package" },
];

export function mapGovernedPendingActionsEnvelope(
  payload: unknown,
): GovernedPendingActionsResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.approvalQueue !== undefined ||
    root.clinicalWorkspacePackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedPendingActionsComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    approvalQueue: data.approvalQueue ?? null,
    clinicalWorkspacePackage: data.clinicalWorkspacePackage ?? null,
    components,
    governance: { ...GOVERNED_PENDING_ACTIONS_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

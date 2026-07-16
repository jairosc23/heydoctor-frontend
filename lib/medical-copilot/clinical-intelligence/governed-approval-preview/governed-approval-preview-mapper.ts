import {
  GOVERNED_APPROVAL_PREVIEW_GOVERNANCE,
  type GovernedApprovalPreviewComponentKey,
  type GovernedApprovalPreviewComponentPresence,
  type GovernedApprovalPreviewResult,
} from "./governed-approval-preview";

const COMPONENT_DEFS: Array<{
  key: GovernedApprovalPreviewComponentKey;
  label: string;
}> = [
  { key: "validationWorkspace", label: "Validation Workspace" },
  { key: "physicianWorkspace", label: "Physician Workspace" },
];

export function mapGovernedApprovalPreviewEnvelope(
  payload: unknown,
): GovernedApprovalPreviewResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.validationWorkspace !== undefined ||
    root.physicianWorkspace !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedApprovalPreviewComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    validationWorkspace: data.validationWorkspace ?? null,
    physicianWorkspace: data.physicianWorkspace ?? null,
    components,
    governance: { ...GOVERNED_APPROVAL_PREVIEW_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

import {
  GOVERNED_APPROVAL_QUEUE_GOVERNANCE,
  type GovernedApprovalQueueComponentKey,
  type GovernedApprovalQueueComponentPresence,
  type GovernedApprovalQueueResult,
} from "./governed-approval-queue";

const COMPONENT_DEFS: Array<{
  key: GovernedApprovalQueueComponentKey;
  label: string;
}> = [
  { key: "approvalPreview", label: "Approval Preview" },
  { key: "consultationPackage", label: "Consultation Package" },
];

export function mapGovernedApprovalQueueEnvelope(
  payload: unknown,
): GovernedApprovalQueueResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.approvalPreview !== undefined ||
    root.consultationPackage !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const components: GovernedApprovalQueueComponentPresence[] =
    COMPONENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    approvalPreview: data.approvalPreview ?? null,
    consultationPackage: data.consultationPackage ?? null,
    components,
    governance: { ...GOVERNED_APPROVAL_QUEUE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

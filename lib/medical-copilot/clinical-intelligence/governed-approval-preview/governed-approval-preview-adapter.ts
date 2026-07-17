import { getMedicalCopilotGovernedApprovalPreview } from "../../api";
import { mapGovernedApprovalPreviewEnvelope } from "./governed-approval-preview-mapper";
import type { GovernedApprovalPreviewResult } from "./governed-approval-preview";

export async function getGovernedApprovalPreview(
  sessionId: string,
): Promise<GovernedApprovalPreviewResult | null> {
  const envelope = await getMedicalCopilotGovernedApprovalPreview(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedApprovalPreviewEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedApprovalPreviewReadAdapter = {
  getGovernedApprovalPreview: typeof getGovernedApprovalPreview;
};

export const governedApprovalPreviewReadAdapter: GovernedApprovalPreviewReadAdapter = {
  getGovernedApprovalPreview,
};

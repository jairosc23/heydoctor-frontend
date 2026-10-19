import { getMedicalCopilotGovernedApprovalQueue } from "../../api";
import { mapGovernedApprovalQueueEnvelope } from "./governed-approval-queue-mapper";
import type { GovernedApprovalQueueResult } from "./governed-approval-queue";

export async function getGovernedApprovalQueue(
  sessionId: string,
): Promise<GovernedApprovalQueueResult | null> {
  const envelope = await getMedicalCopilotGovernedApprovalQueue(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedApprovalQueueEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedApprovalQueueReadAdapter = {
  getGovernedApprovalQueue: typeof getGovernedApprovalQueue;
};

export const governedApprovalQueueReadAdapter: GovernedApprovalQueueReadAdapter = {
  getGovernedApprovalQueue,
};

import { getMedicalCopilotGovernedPendingActions } from "../../api";
import { mapGovernedPendingActionsEnvelope } from "./governed-pending-actions-mapper";
import type { GovernedPendingActionsResult } from "./governed-pending-actions";

export async function getGovernedPendingActions(
  sessionId: string,
): Promise<GovernedPendingActionsResult | null> {
  const envelope = await getMedicalCopilotGovernedPendingActions(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPendingActionsEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPendingActionsReadAdapter = {
  getGovernedPendingActions: typeof getGovernedPendingActions;
};

export const governedPendingActionsReadAdapter: GovernedPendingActionsReadAdapter = {
  getGovernedPendingActions,
};

import { getMedicalCopilotGovernedClinicalWorkspaceConsolidation } from "../../api";
import { mapGovernedClinicalWorkspaceConsolidationEnvelope } from "./governed-clinical-workspace-consolidation-mapper";
import type { GovernedClinicalWorkspaceConsolidationResult } from "./governed-clinical-workspace-consolidation";

export async function getGovernedClinicalWorkspaceConsolidation(
  sessionId: string,
): Promise<GovernedClinicalWorkspaceConsolidationResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalWorkspaceConsolidation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalWorkspaceConsolidationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalWorkspaceConsolidationReadAdapter = {
  getGovernedClinicalWorkspaceConsolidation: typeof getGovernedClinicalWorkspaceConsolidation;
};

export const governedClinicalWorkspaceConsolidationReadAdapter: GovernedClinicalWorkspaceConsolidationReadAdapter = {
  getGovernedClinicalWorkspaceConsolidation,
};

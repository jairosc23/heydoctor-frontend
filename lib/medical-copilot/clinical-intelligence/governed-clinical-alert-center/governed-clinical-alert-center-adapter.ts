import { getMedicalCopilotGovernedClinicalAlertCenter } from "../../api";
import { mapGovernedClinicalAlertCenterEnvelope } from "./governed-clinical-alert-center-mapper";
import type { GovernedClinicalAlertCenterResult } from "./governed-clinical-alert-center";

export async function getGovernedClinicalAlertCenter(sessionId: string): Promise<GovernedClinicalAlertCenterResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalAlertCenter(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalAlertCenterEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalAlertCenterReadAdapter = { getGovernedClinicalAlertCenter: typeof getGovernedClinicalAlertCenter };
export const governedClinicalAlertCenterReadAdapter: GovernedClinicalAlertCenterReadAdapter = { getGovernedClinicalAlertCenter };

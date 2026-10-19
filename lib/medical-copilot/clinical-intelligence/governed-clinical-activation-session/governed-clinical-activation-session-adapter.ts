import { getMedicalCopilotGovernedClinicalActivationSession } from "../../api";
import { mapGovernedClinicalActivationSessionEnvelope } from "./governed-clinical-activation-session-mapper";
import type { GovernedClinicalActivationSessionResult } from "./governed-clinical-activation-session";

export async function getGovernedClinicalActivationSession(
  sessionId: string,
): Promise<GovernedClinicalActivationSessionResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalActivationSession(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalActivationSessionEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalActivationSessionReadAdapter = {
  getGovernedClinicalActivationSession: typeof getGovernedClinicalActivationSession;
};

export const governedClinicalActivationSessionReadAdapter: GovernedClinicalActivationSessionReadAdapter = {
  getGovernedClinicalActivationSession,
};

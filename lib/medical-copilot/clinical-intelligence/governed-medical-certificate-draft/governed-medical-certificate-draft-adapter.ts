import { getMedicalCopilotGovernedMedicalCertificateDraft } from "../../api";
import { mapGovernedMedicalCertificateDraftEnvelope } from "./governed-medical-certificate-draft-mapper";
import type { GovernedMedicalCertificateDraftResult } from "./governed-medical-certificate-draft";

export async function getGovernedMedicalCertificateDraft(
  sessionId: string,
): Promise<GovernedMedicalCertificateDraftResult | null> {
  const envelope =
    await getMedicalCopilotGovernedMedicalCertificateDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedMedicalCertificateDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedMedicalCertificateDraftReadAdapter = {
  getGovernedMedicalCertificateDraft: typeof getGovernedMedicalCertificateDraft;
};

export const governedMedicalCertificateDraftReadAdapter: GovernedMedicalCertificateDraftReadAdapter =
  { getGovernedMedicalCertificateDraft };

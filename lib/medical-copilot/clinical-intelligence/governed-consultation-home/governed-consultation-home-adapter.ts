import { getMedicalCopilotGovernedConsultationHome } from "../../api";
import { mapGovernedConsultationHomeEnvelope } from "./governed-consultation-home-mapper";
import type { GovernedConsultationHomeResult } from "./governed-consultation-home";

export async function getGovernedConsultationHome(
  sessionId: string,
): Promise<GovernedConsultationHomeResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationHome(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationHomeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationHomeReadAdapter = {
  getGovernedConsultationHome: typeof getGovernedConsultationHome;
};

export const governedConsultationHomeReadAdapter: GovernedConsultationHomeReadAdapter = {
  getGovernedConsultationHome,
};

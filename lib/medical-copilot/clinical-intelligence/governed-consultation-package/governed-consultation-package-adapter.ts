import { getMedicalCopilotGovernedConsultationPackage } from "../../api";
import { mapGovernedConsultationPackageEnvelope } from "./governed-consultation-package-mapper";
import type { GovernedConsultationPackageResult } from "./governed-consultation-package";

export async function getGovernedConsultationPackage(
  sessionId: string,
): Promise<GovernedConsultationPackageResult | null> {
  const envelope = await getMedicalCopilotGovernedConsultationPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedConsultationPackageEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedConsultationPackageReadAdapter = {
  getGovernedConsultationPackage: typeof getGovernedConsultationPackage;
};

export const governedConsultationPackageReadAdapter: GovernedConsultationPackageReadAdapter = {
  getGovernedConsultationPackage,
};

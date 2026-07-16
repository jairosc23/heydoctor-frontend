import { getMedicalCopilotGovernedClinicalDocumentsPersistenceBridge } from "../../api";
import { mapGovernedClinicalDocumentsPersistenceBridgeEnvelope } from "./governed-clinical-documents-persistence-bridge-mapper";
import type { GovernedClinicalDocumentsPersistenceBridgeResult } from "./governed-clinical-documents-persistence-bridge";

export async function getGovernedClinicalDocumentsPersistenceBridge(
  sessionId: string,
): Promise<GovernedClinicalDocumentsPersistenceBridgeResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalDocumentsPersistenceBridge(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalDocumentsPersistenceBridgeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalDocumentsPersistenceBridgeReadAdapter = {
  getGovernedClinicalDocumentsPersistenceBridge: typeof getGovernedClinicalDocumentsPersistenceBridge;
};

export const governedClinicalDocumentsPersistenceBridgeReadAdapter: GovernedClinicalDocumentsPersistenceBridgeReadAdapter = {
  getGovernedClinicalDocumentsPersistenceBridge,
};

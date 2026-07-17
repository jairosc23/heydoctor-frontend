import { getMedicalCopilotGovernedClinicalMappingPackage } from "../../api";
import { mapGovernedClinicalEntityMappingEnvelope } from "./governed-clinical-entity-mapping-mapper";
import type { GovernedClinicalEntityMappingResult } from "./governed-clinical-entity-mapping";

export async function getGovernedClinicalEntityMapping(
  sessionId: string,
): Promise<GovernedClinicalEntityMappingResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalMappingPackage(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalEntityMappingEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalEntityMappingReadAdapter = {
  getGovernedClinicalEntityMapping: typeof getGovernedClinicalEntityMapping;
};

export const governedClinicalEntityMappingReadAdapter: GovernedClinicalEntityMappingReadAdapter = {
  getGovernedClinicalEntityMapping,
};

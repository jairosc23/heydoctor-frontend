import { getMedicalCopilotGovernedClinicalEncounter } from "../../api";
import { mapGovernedClinicalEncounterEnvelope } from "./governed-clinical-encounter-mapper";
import type { GovernedClinicalEncounterResult } from "./governed-clinical-encounter";

export async function getGovernedClinicalEncounter(
  sessionId: string,
): Promise<GovernedClinicalEncounterResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalEncounter(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedClinicalEncounterEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedClinicalEncounterReadAdapter = {
  getGovernedClinicalEncounter: typeof getGovernedClinicalEncounter;
};

export const governedClinicalEncounterReadAdapter: GovernedClinicalEncounterReadAdapter =
  { getGovernedClinicalEncounter };

import { getMedicalCopilotGovernedEncounterConsolidation } from "../../api";
import { mapGovernedEncounterConsolidationEnvelope } from "./governed-encounter-consolidation-mapper";
import type { GovernedEncounterConsolidationResult } from "./governed-encounter-consolidation";

export async function getGovernedEncounterConsolidation(
  sessionId: string,
): Promise<GovernedEncounterConsolidationResult | null> {
  const envelope = await getMedicalCopilotGovernedEncounterConsolidation(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedEncounterConsolidationEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedEncounterConsolidationReadAdapter = {
  getGovernedEncounterConsolidation: typeof getGovernedEncounterConsolidation;
};

export const governedEncounterConsolidationReadAdapter: GovernedEncounterConsolidationReadAdapter = {
  getGovernedEncounterConsolidation,
};

import { getMedicalCopilotGovernedAllergyCrossCheck } from "../../api";
import { mapGovernedAllergyCrossCheckEnvelope } from "./governed-allergy-cross-check-mapper";
import type { GovernedAllergyCrossCheckResult } from "./governed-allergy-cross-check";

export async function getGovernedAllergyCrossCheck(sessionId: string): Promise<GovernedAllergyCrossCheckResult | null> {
  const envelope = await getMedicalCopilotGovernedAllergyCrossCheck(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedAllergyCrossCheckEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedAllergyCrossCheckReadAdapter = { getGovernedAllergyCrossCheck: typeof getGovernedAllergyCrossCheck };
export const governedAllergyCrossCheckReadAdapter: GovernedAllergyCrossCheckReadAdapter = { getGovernedAllergyCrossCheck };

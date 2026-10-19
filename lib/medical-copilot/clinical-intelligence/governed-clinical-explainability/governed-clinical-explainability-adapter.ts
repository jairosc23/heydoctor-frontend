import { getMedicalCopilotGovernedClinicalExplainability } from "../../api";
import { mapGovernedClinicalExplainabilityEnvelope } from "./governed-clinical-explainability-mapper";
import type { GovernedClinicalExplainabilityResult } from "./governed-clinical-explainability";

export async function getGovernedClinicalExplainability(sessionId: string): Promise<GovernedClinicalExplainabilityResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalExplainability(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalExplainabilityEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalExplainabilityReadAdapter = { getGovernedClinicalExplainability: typeof getGovernedClinicalExplainability };
export const governedClinicalExplainabilityReadAdapter: GovernedClinicalExplainabilityReadAdapter = { getGovernedClinicalExplainability };

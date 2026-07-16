import { getMedicalCopilotGovernedDrugInteractionAnalysis } from "../../api";
import { mapGovernedDrugInteractionAnalysisEnvelope } from "./governed-drug-interaction-analysis-mapper";
import type { GovernedDrugInteractionAnalysisResult } from "./governed-drug-interaction-analysis";

export async function getGovernedDrugInteractionAnalysis(sessionId: string): Promise<GovernedDrugInteractionAnalysisResult | null> {
  const envelope = await getMedicalCopilotGovernedDrugInteractionAnalysis(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedDrugInteractionAnalysisEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedDrugInteractionAnalysisReadAdapter = { getGovernedDrugInteractionAnalysis: typeof getGovernedDrugInteractionAnalysis };
export const governedDrugInteractionAnalysisReadAdapter: GovernedDrugInteractionAnalysisReadAdapter = { getGovernedDrugInteractionAnalysis };

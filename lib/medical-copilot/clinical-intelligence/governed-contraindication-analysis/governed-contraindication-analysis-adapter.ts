import { getMedicalCopilotGovernedContraindicationAnalysis } from "../../api";
import { mapGovernedContraindicationAnalysisEnvelope } from "./governed-contraindication-analysis-mapper";
import type { GovernedContraindicationAnalysisResult } from "./governed-contraindication-analysis";

export async function getGovernedContraindicationAnalysis(sessionId: string): Promise<GovernedContraindicationAnalysisResult | null> {
  const envelope = await getMedicalCopilotGovernedContraindicationAnalysis(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedContraindicationAnalysisEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedContraindicationAnalysisReadAdapter = { getGovernedContraindicationAnalysis: typeof getGovernedContraindicationAnalysis };
export const governedContraindicationAnalysisReadAdapter: GovernedContraindicationAnalysisReadAdapter = { getGovernedContraindicationAnalysis };

import { getMedicalCopilotGovernedChronicDiseaseFollowUpAnalysis } from "../../api";
import { mapGovernedChronicDiseaseFollowUpAnalysisEnvelope } from "./governed-chronic-disease-follow-up-analysis-mapper";
import type { GovernedChronicDiseaseFollowUpAnalysisResult } from "./governed-chronic-disease-follow-up-analysis";

export async function getGovernedChronicDiseaseFollowUpAnalysis(sessionId: string): Promise<GovernedChronicDiseaseFollowUpAnalysisResult | null> {
  const envelope = await getMedicalCopilotGovernedChronicDiseaseFollowUpAnalysis(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedChronicDiseaseFollowUpAnalysisEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedChronicDiseaseFollowUpAnalysisReadAdapter = { getGovernedChronicDiseaseFollowUpAnalysis: typeof getGovernedChronicDiseaseFollowUpAnalysis };
export const governedChronicDiseaseFollowUpAnalysisReadAdapter: GovernedChronicDiseaseFollowUpAnalysisReadAdapter = { getGovernedChronicDiseaseFollowUpAnalysis };

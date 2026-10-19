import { getMedicalCopilotGovernedGeriatricAssessmentEngine } from "../../api";
import { mapGovernedGeriatricAssessmentEngineEnvelope } from "./governed-geriatric-assessment-engine-mapper";
import type { GovernedGeriatricAssessmentEngineResult } from "./governed-geriatric-assessment-engine";
export async function getGovernedGeriatricAssessmentEngine(sessionId: string): Promise<GovernedGeriatricAssessmentEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedGeriatricAssessmentEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedGeriatricAssessmentEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedGeriatricAssessmentEngineReadAdapter = { getGovernedGeriatricAssessmentEngine: typeof getGovernedGeriatricAssessmentEngine };
export const governedGeriatricAssessmentEngineReadAdapter: GovernedGeriatricAssessmentEngineReadAdapter = { getGovernedGeriatricAssessmentEngine };

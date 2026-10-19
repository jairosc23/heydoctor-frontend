import { getMedicalCopilotGovernedPolypharmacyAnalysisEngine } from "../../api";
import { mapGovernedPolypharmacyAnalysisEngineEnvelope } from "./governed-polypharmacy-analysis-engine-mapper";
import type { GovernedPolypharmacyAnalysisEngineResult } from "./governed-polypharmacy-analysis-engine";
export async function getGovernedPolypharmacyAnalysisEngine(sessionId: string): Promise<GovernedPolypharmacyAnalysisEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPolypharmacyAnalysisEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPolypharmacyAnalysisEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedPolypharmacyAnalysisEngineReadAdapter = { getGovernedPolypharmacyAnalysisEngine: typeof getGovernedPolypharmacyAnalysisEngine };
export const governedPolypharmacyAnalysisEngineReadAdapter: GovernedPolypharmacyAnalysisEngineReadAdapter = { getGovernedPolypharmacyAnalysisEngine };

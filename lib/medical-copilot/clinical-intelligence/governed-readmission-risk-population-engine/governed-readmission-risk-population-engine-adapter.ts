import { getMedicalCopilotGovernedReadmissionRiskPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedReadmissionRiskPopulationEngineEnvelope } from "./governed-readmission-risk-population-engine-mapper";
import type { GovernedReadmissionRiskPopulationEngineResult } from "./governed-readmission-risk-population-engine";
export type GovernedReadmissionRiskPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedReadmissionRiskPopulationEngineResult | null> };
export async function getGovernedReadmissionRiskPopulationEngine(sessionId: string): Promise<GovernedReadmissionRiskPopulationEngineResult | null> { return mapGovernedReadmissionRiskPopulationEngineEnvelope(await getMedicalCopilotGovernedReadmissionRiskPopulationEngine(sessionId)); }
export const governedReadmissionRiskPopulationEngineReadAdapter: GovernedReadmissionRiskPopulationEngineReadAdapter = { get: getGovernedReadmissionRiskPopulationEngine };

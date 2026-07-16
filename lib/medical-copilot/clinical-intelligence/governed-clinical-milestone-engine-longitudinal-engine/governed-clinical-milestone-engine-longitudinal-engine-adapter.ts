import { getMedicalCopilotGovernedClinicalMilestoneEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalMilestoneEngineLongitudinalEngineEnvelope } from "./governed-clinical-milestone-engine-longitudinal-engine-mapper";
import type { GovernedClinicalMilestoneEngineLongitudinalEngineResult } from "./governed-clinical-milestone-engine-longitudinal-engine";
export type GovernedClinicalMilestoneEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalMilestoneEngineLongitudinalEngineResult | null> };
export async function getGovernedClinicalMilestoneEngineLongitudinalEngine(sessionId: string): Promise<GovernedClinicalMilestoneEngineLongitudinalEngineResult | null> { return mapGovernedClinicalMilestoneEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedClinicalMilestoneEngineLongitudinalEngine(sessionId)); }
export const governedClinicalMilestoneEngineLongitudinalEngineReadAdapter: GovernedClinicalMilestoneEngineLongitudinalEngineReadAdapter = { get: getGovernedClinicalMilestoneEngineLongitudinalEngine };

import { getMedicalCopilotGovernedVaccinationTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedVaccinationTimelineLongitudinalEngineEnvelope } from "./governed-vaccination-timeline-longitudinal-engine-mapper";
import type { GovernedVaccinationTimelineLongitudinalEngineResult } from "./governed-vaccination-timeline-longitudinal-engine";
export type GovernedVaccinationTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedVaccinationTimelineLongitudinalEngineResult | null> };
export async function getGovernedVaccinationTimelineLongitudinalEngine(sessionId: string): Promise<GovernedVaccinationTimelineLongitudinalEngineResult | null> { return mapGovernedVaccinationTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedVaccinationTimelineLongitudinalEngine(sessionId)); }
export const governedVaccinationTimelineLongitudinalEngineReadAdapter: GovernedVaccinationTimelineLongitudinalEngineReadAdapter = { get: getGovernedVaccinationTimelineLongitudinalEngine };

import { getMedicalCopilotGovernedHospitalizationTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedHospitalizationTimelineLongitudinalEngineEnvelope } from "./governed-hospitalization-timeline-longitudinal-engine-mapper";
import type { GovernedHospitalizationTimelineLongitudinalEngineResult } from "./governed-hospitalization-timeline-longitudinal-engine";
export type GovernedHospitalizationTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedHospitalizationTimelineLongitudinalEngineResult | null> };
export async function getGovernedHospitalizationTimelineLongitudinalEngine(sessionId: string): Promise<GovernedHospitalizationTimelineLongitudinalEngineResult | null> { return mapGovernedHospitalizationTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedHospitalizationTimelineLongitudinalEngine(sessionId)); }
export const governedHospitalizationTimelineLongitudinalEngineReadAdapter: GovernedHospitalizationTimelineLongitudinalEngineReadAdapter = { get: getGovernedHospitalizationTimelineLongitudinalEngine };

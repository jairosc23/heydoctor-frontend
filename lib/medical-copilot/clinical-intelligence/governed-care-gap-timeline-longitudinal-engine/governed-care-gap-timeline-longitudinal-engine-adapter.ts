import { getMedicalCopilotGovernedCareGapTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedCareGapTimelineLongitudinalEngineEnvelope } from "./governed-care-gap-timeline-longitudinal-engine-mapper";
import type { GovernedCareGapTimelineLongitudinalEngineResult } from "./governed-care-gap-timeline-longitudinal-engine";
export type GovernedCareGapTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedCareGapTimelineLongitudinalEngineResult | null> };
export async function getGovernedCareGapTimelineLongitudinalEngine(sessionId: string): Promise<GovernedCareGapTimelineLongitudinalEngineResult | null> { return mapGovernedCareGapTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedCareGapTimelineLongitudinalEngine(sessionId)); }
export const governedCareGapTimelineLongitudinalEngineReadAdapter: GovernedCareGapTimelineLongitudinalEngineReadAdapter = { get: getGovernedCareGapTimelineLongitudinalEngine };

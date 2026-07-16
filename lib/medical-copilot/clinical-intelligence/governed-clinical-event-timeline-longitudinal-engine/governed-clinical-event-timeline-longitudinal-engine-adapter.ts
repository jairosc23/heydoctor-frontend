import { getMedicalCopilotGovernedClinicalEventTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalEventTimelineLongitudinalEngineEnvelope } from "./governed-clinical-event-timeline-longitudinal-engine-mapper";
import type { GovernedClinicalEventTimelineLongitudinalEngineResult } from "./governed-clinical-event-timeline-longitudinal-engine";
export type GovernedClinicalEventTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalEventTimelineLongitudinalEngineResult | null> };
export async function getGovernedClinicalEventTimelineLongitudinalEngine(sessionId: string): Promise<GovernedClinicalEventTimelineLongitudinalEngineResult | null> { return mapGovernedClinicalEventTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedClinicalEventTimelineLongitudinalEngine(sessionId)); }
export const governedClinicalEventTimelineLongitudinalEngineReadAdapter: GovernedClinicalEventTimelineLongitudinalEngineReadAdapter = { get: getGovernedClinicalEventTimelineLongitudinalEngine };

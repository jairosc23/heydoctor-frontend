import { getMedicalCopilotGovernedPatientTimelineEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPatientTimelineEngineLongitudinalEngineEnvelope } from "./governed-patient-timeline-engine-longitudinal-engine-mapper";
import type { GovernedPatientTimelineEngineLongitudinalEngineResult } from "./governed-patient-timeline-engine-longitudinal-engine";
export type GovernedPatientTimelineEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPatientTimelineEngineLongitudinalEngineResult | null> };
export async function getGovernedPatientTimelineEngineLongitudinalEngine(sessionId: string): Promise<GovernedPatientTimelineEngineLongitudinalEngineResult | null> { return mapGovernedPatientTimelineEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedPatientTimelineEngineLongitudinalEngine(sessionId)); }
export const governedPatientTimelineEngineLongitudinalEngineReadAdapter: GovernedPatientTimelineEngineLongitudinalEngineReadAdapter = { get: getGovernedPatientTimelineEngineLongitudinalEngine };

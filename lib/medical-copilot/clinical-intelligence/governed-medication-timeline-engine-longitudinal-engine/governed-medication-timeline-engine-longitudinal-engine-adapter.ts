import { getMedicalCopilotGovernedMedicationTimelineEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedMedicationTimelineEngineLongitudinalEngineEnvelope } from "./governed-medication-timeline-engine-longitudinal-engine-mapper";
import type { GovernedMedicationTimelineEngineLongitudinalEngineResult } from "./governed-medication-timeline-engine-longitudinal-engine";
export type GovernedMedicationTimelineEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedMedicationTimelineEngineLongitudinalEngineResult | null> };
export async function getGovernedMedicationTimelineEngineLongitudinalEngine(sessionId: string): Promise<GovernedMedicationTimelineEngineLongitudinalEngineResult | null> { return mapGovernedMedicationTimelineEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedMedicationTimelineEngineLongitudinalEngine(sessionId)); }
export const governedMedicationTimelineEngineLongitudinalEngineReadAdapter: GovernedMedicationTimelineEngineLongitudinalEngineReadAdapter = { get: getGovernedMedicationTimelineEngineLongitudinalEngine };

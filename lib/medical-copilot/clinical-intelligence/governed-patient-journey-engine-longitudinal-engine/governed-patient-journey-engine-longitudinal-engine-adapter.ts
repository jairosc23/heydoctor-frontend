import { getMedicalCopilotGovernedPatientJourneyEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPatientJourneyEngineLongitudinalEngineEnvelope } from "./governed-patient-journey-engine-longitudinal-engine-mapper";
import type { GovernedPatientJourneyEngineLongitudinalEngineResult } from "./governed-patient-journey-engine-longitudinal-engine";
export type GovernedPatientJourneyEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPatientJourneyEngineLongitudinalEngineResult | null> };
export async function getGovernedPatientJourneyEngineLongitudinalEngine(sessionId: string): Promise<GovernedPatientJourneyEngineLongitudinalEngineResult | null> { return mapGovernedPatientJourneyEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedPatientJourneyEngineLongitudinalEngine(sessionId)); }
export const governedPatientJourneyEngineLongitudinalEngineReadAdapter: GovernedPatientJourneyEngineLongitudinalEngineReadAdapter = { get: getGovernedPatientJourneyEngineLongitudinalEngine };

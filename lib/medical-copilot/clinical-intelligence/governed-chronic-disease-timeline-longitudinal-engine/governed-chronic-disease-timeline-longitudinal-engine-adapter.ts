import { getMedicalCopilotGovernedChronicDiseaseTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedChronicDiseaseTimelineLongitudinalEngineEnvelope } from "./governed-chronic-disease-timeline-longitudinal-engine-mapper";
import type { GovernedChronicDiseaseTimelineLongitudinalEngineResult } from "./governed-chronic-disease-timeline-longitudinal-engine";
export type GovernedChronicDiseaseTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedChronicDiseaseTimelineLongitudinalEngineResult | null> };
export async function getGovernedChronicDiseaseTimelineLongitudinalEngine(sessionId: string): Promise<GovernedChronicDiseaseTimelineLongitudinalEngineResult | null> { return mapGovernedChronicDiseaseTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedChronicDiseaseTimelineLongitudinalEngine(sessionId)); }
export const governedChronicDiseaseTimelineLongitudinalEngineReadAdapter: GovernedChronicDiseaseTimelineLongitudinalEngineReadAdapter = { get: getGovernedChronicDiseaseTimelineLongitudinalEngine };

import { getMedicalCopilotGovernedChronicDiseaseRegistryPopulationEngine } from "@/lib/medical-copilot/api";
import { mapGovernedChronicDiseaseRegistryPopulationEngineEnvelope } from "./governed-chronic-disease-registry-population-engine-mapper";
import type { GovernedChronicDiseaseRegistryPopulationEngineResult } from "./governed-chronic-disease-registry-population-engine";
export type GovernedChronicDiseaseRegistryPopulationEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedChronicDiseaseRegistryPopulationEngineResult | null> };
export async function getGovernedChronicDiseaseRegistryPopulationEngine(sessionId: string): Promise<GovernedChronicDiseaseRegistryPopulationEngineResult | null> { return mapGovernedChronicDiseaseRegistryPopulationEngineEnvelope(await getMedicalCopilotGovernedChronicDiseaseRegistryPopulationEngine(sessionId)); }
export const governedChronicDiseaseRegistryPopulationEngineReadAdapter: GovernedChronicDiseaseRegistryPopulationEngineReadAdapter = { get: getGovernedChronicDiseaseRegistryPopulationEngine };

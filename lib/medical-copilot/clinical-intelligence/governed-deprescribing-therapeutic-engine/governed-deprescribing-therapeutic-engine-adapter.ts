import { getMedicalCopilotGovernedDeprescribingTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedDeprescribingTherapeuticEngineEnvelope } from "./governed-deprescribing-therapeutic-engine-mapper";
import type { GovernedDeprescribingTherapeuticEngineResult } from "./governed-deprescribing-therapeutic-engine";
export type GovernedDeprescribingTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedDeprescribingTherapeuticEngineResult | null> };
export async function getGovernedDeprescribingTherapeuticEngine(sessionId: string): Promise<GovernedDeprescribingTherapeuticEngineResult | null> { return mapGovernedDeprescribingTherapeuticEngineEnvelope(await getMedicalCopilotGovernedDeprescribingTherapeuticEngine(sessionId)); }
export const governedDeprescribingTherapeuticEngineReadAdapter: GovernedDeprescribingTherapeuticEngineReadAdapter = { get: getGovernedDeprescribingTherapeuticEngine };

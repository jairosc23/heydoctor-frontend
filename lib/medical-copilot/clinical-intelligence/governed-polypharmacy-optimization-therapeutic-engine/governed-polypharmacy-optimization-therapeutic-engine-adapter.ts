import { getMedicalCopilotGovernedPolypharmacyOptimizationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedPolypharmacyOptimizationTherapeuticEngineEnvelope } from "./governed-polypharmacy-optimization-therapeutic-engine-mapper";
import type { GovernedPolypharmacyOptimizationTherapeuticEngineResult } from "./governed-polypharmacy-optimization-therapeutic-engine";
export type GovernedPolypharmacyOptimizationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedPolypharmacyOptimizationTherapeuticEngineResult | null> };
export async function getGovernedPolypharmacyOptimizationTherapeuticEngine(sessionId: string): Promise<GovernedPolypharmacyOptimizationTherapeuticEngineResult | null> { return mapGovernedPolypharmacyOptimizationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedPolypharmacyOptimizationTherapeuticEngine(sessionId)); }
export const governedPolypharmacyOptimizationTherapeuticEngineReadAdapter: GovernedPolypharmacyOptimizationTherapeuticEngineReadAdapter = { get: getGovernedPolypharmacyOptimizationTherapeuticEngine };

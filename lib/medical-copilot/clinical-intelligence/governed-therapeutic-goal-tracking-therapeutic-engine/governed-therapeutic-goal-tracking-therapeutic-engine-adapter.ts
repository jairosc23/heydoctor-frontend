import { getMedicalCopilotGovernedTherapeuticGoalTrackingTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTherapeuticGoalTrackingTherapeuticEngineEnvelope } from "./governed-therapeutic-goal-tracking-therapeutic-engine-mapper";
import type { GovernedTherapeuticGoalTrackingTherapeuticEngineResult } from "./governed-therapeutic-goal-tracking-therapeutic-engine";
export type GovernedTherapeuticGoalTrackingTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTherapeuticGoalTrackingTherapeuticEngineResult | null> };
export async function getGovernedTherapeuticGoalTrackingTherapeuticEngine(sessionId: string): Promise<GovernedTherapeuticGoalTrackingTherapeuticEngineResult | null> { return mapGovernedTherapeuticGoalTrackingTherapeuticEngineEnvelope(await getMedicalCopilotGovernedTherapeuticGoalTrackingTherapeuticEngine(sessionId)); }
export const governedTherapeuticGoalTrackingTherapeuticEngineReadAdapter: GovernedTherapeuticGoalTrackingTherapeuticEngineReadAdapter = { get: getGovernedTherapeuticGoalTrackingTherapeuticEngine };

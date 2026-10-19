import { getMedicalCopilotGovernedSideEffectSurveillanceTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedSideEffectSurveillanceTherapeuticEngineEnvelope } from "./governed-side-effect-surveillance-therapeutic-engine-mapper";
import type { GovernedSideEffectSurveillanceTherapeuticEngineResult } from "./governed-side-effect-surveillance-therapeutic-engine";
export type GovernedSideEffectSurveillanceTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedSideEffectSurveillanceTherapeuticEngineResult | null> };
export async function getGovernedSideEffectSurveillanceTherapeuticEngine(sessionId: string): Promise<GovernedSideEffectSurveillanceTherapeuticEngineResult | null> { return mapGovernedSideEffectSurveillanceTherapeuticEngineEnvelope(await getMedicalCopilotGovernedSideEffectSurveillanceTherapeuticEngine(sessionId)); }
export const governedSideEffectSurveillanceTherapeuticEngineReadAdapter: GovernedSideEffectSurveillanceTherapeuticEngineReadAdapter = { get: getGovernedSideEffectSurveillanceTherapeuticEngine };

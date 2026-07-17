import { getMedicalCopilotGovernedTherapeuticEscalationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTherapeuticEscalationTherapeuticEngineEnvelope } from "./governed-therapeutic-escalation-therapeutic-engine-mapper";
import type { GovernedTherapeuticEscalationTherapeuticEngineResult } from "./governed-therapeutic-escalation-therapeutic-engine";
export type GovernedTherapeuticEscalationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTherapeuticEscalationTherapeuticEngineResult | null> };
export async function getGovernedTherapeuticEscalationTherapeuticEngine(sessionId: string): Promise<GovernedTherapeuticEscalationTherapeuticEngineResult | null> { return mapGovernedTherapeuticEscalationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedTherapeuticEscalationTherapeuticEngine(sessionId)); }
export const governedTherapeuticEscalationTherapeuticEngineReadAdapter: GovernedTherapeuticEscalationTherapeuticEngineReadAdapter = { get: getGovernedTherapeuticEscalationTherapeuticEngine };

import { getMedicalCopilotGovernedTherapeuticDeEscalationTherapeuticEngine } from "@/lib/medical-copilot/api";
import { mapGovernedTherapeuticDeEscalationTherapeuticEngineEnvelope } from "./governed-therapeutic-de-escalation-therapeutic-engine-mapper";
import type { GovernedTherapeuticDeEscalationTherapeuticEngineResult } from "./governed-therapeutic-de-escalation-therapeutic-engine";
export type GovernedTherapeuticDeEscalationTherapeuticEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedTherapeuticDeEscalationTherapeuticEngineResult | null> };
export async function getGovernedTherapeuticDeEscalationTherapeuticEngine(sessionId: string): Promise<GovernedTherapeuticDeEscalationTherapeuticEngineResult | null> { return mapGovernedTherapeuticDeEscalationTherapeuticEngineEnvelope(await getMedicalCopilotGovernedTherapeuticDeEscalationTherapeuticEngine(sessionId)); }
export const governedTherapeuticDeEscalationTherapeuticEngineReadAdapter: GovernedTherapeuticDeEscalationTherapeuticEngineReadAdapter = { get: getGovernedTherapeuticDeEscalationTherapeuticEngine };

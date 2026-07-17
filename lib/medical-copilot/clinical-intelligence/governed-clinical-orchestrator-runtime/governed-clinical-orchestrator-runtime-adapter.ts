import { getMedicalCopilotGovernedClinicalOrchestratorRuntime } from "@/lib/medical-copilot/api";
import { mapGovernedClinicalOrchestratorRuntimeEnvelope } from "./governed-clinical-orchestrator-runtime-mapper";
import type { GovernedClinicalOrchestratorRuntimeResult } from "./governed-clinical-orchestrator-runtime";
export type GovernedClinicalOrchestratorRuntimeReadAdapter = { get: (sessionId: string) => Promise<GovernedClinicalOrchestratorRuntimeResult | null> };
export async function getGovernedClinicalOrchestratorRuntime(sessionId: string): Promise<GovernedClinicalOrchestratorRuntimeResult | null> { return mapGovernedClinicalOrchestratorRuntimeEnvelope(await getMedicalCopilotGovernedClinicalOrchestratorRuntime(sessionId)); }
export const governedClinicalOrchestratorRuntimeReadAdapter: GovernedClinicalOrchestratorRuntimeReadAdapter = { get: getGovernedClinicalOrchestratorRuntime };

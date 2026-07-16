import { getMedicalCopilotGovernedProcedureTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedProcedureTimelineLongitudinalEngineEnvelope } from "./governed-procedure-timeline-longitudinal-engine-mapper";
import type { GovernedProcedureTimelineLongitudinalEngineResult } from "./governed-procedure-timeline-longitudinal-engine";
export type GovernedProcedureTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedProcedureTimelineLongitudinalEngineResult | null> };
export async function getGovernedProcedureTimelineLongitudinalEngine(sessionId: string): Promise<GovernedProcedureTimelineLongitudinalEngineResult | null> { return mapGovernedProcedureTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedProcedureTimelineLongitudinalEngine(sessionId)); }
export const governedProcedureTimelineLongitudinalEngineReadAdapter: GovernedProcedureTimelineLongitudinalEngineReadAdapter = { get: getGovernedProcedureTimelineLongitudinalEngine };

import { getMedicalCopilotGovernedImagingTrendEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedImagingTrendEngineLongitudinalEngineEnvelope } from "./governed-imaging-trend-engine-longitudinal-engine-mapper";
import type { GovernedImagingTrendEngineLongitudinalEngineResult } from "./governed-imaging-trend-engine-longitudinal-engine";
export type GovernedImagingTrendEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedImagingTrendEngineLongitudinalEngineResult | null> };
export async function getGovernedImagingTrendEngineLongitudinalEngine(sessionId: string): Promise<GovernedImagingTrendEngineLongitudinalEngineResult | null> { return mapGovernedImagingTrendEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedImagingTrendEngineLongitudinalEngine(sessionId)); }
export const governedImagingTrendEngineLongitudinalEngineReadAdapter: GovernedImagingTrendEngineLongitudinalEngineReadAdapter = { get: getGovernedImagingTrendEngineLongitudinalEngine };

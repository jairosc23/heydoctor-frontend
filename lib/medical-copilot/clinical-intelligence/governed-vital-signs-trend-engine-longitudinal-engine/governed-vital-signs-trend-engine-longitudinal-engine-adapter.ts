import { getMedicalCopilotGovernedVitalSignsTrendEngineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedVitalSignsTrendEngineLongitudinalEngineEnvelope } from "./governed-vital-signs-trend-engine-longitudinal-engine-mapper";
import type { GovernedVitalSignsTrendEngineLongitudinalEngineResult } from "./governed-vital-signs-trend-engine-longitudinal-engine";
export type GovernedVitalSignsTrendEngineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedVitalSignsTrendEngineLongitudinalEngineResult | null> };
export async function getGovernedVitalSignsTrendEngineLongitudinalEngine(sessionId: string): Promise<GovernedVitalSignsTrendEngineLongitudinalEngineResult | null> { return mapGovernedVitalSignsTrendEngineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedVitalSignsTrendEngineLongitudinalEngine(sessionId)); }
export const governedVitalSignsTrendEngineLongitudinalEngineReadAdapter: GovernedVitalSignsTrendEngineLongitudinalEngineReadAdapter = { get: getGovernedVitalSignsTrendEngineLongitudinalEngine };

import { getMedicalCopilotGovernedOutcomeTrackingLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedOutcomeTrackingLongitudinalEngineEnvelope } from "./governed-outcome-tracking-longitudinal-engine-mapper";
import type { GovernedOutcomeTrackingLongitudinalEngineResult } from "./governed-outcome-tracking-longitudinal-engine";
export type GovernedOutcomeTrackingLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedOutcomeTrackingLongitudinalEngineResult | null> };
export async function getGovernedOutcomeTrackingLongitudinalEngine(sessionId: string): Promise<GovernedOutcomeTrackingLongitudinalEngineResult | null> { return mapGovernedOutcomeTrackingLongitudinalEngineEnvelope(await getMedicalCopilotGovernedOutcomeTrackingLongitudinalEngine(sessionId)); }
export const governedOutcomeTrackingLongitudinalEngineReadAdapter: GovernedOutcomeTrackingLongitudinalEngineReadAdapter = { get: getGovernedOutcomeTrackingLongitudinalEngine };

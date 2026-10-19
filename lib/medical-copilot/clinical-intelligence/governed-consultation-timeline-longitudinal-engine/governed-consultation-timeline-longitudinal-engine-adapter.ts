import { getMedicalCopilotGovernedConsultationTimelineLongitudinalEngine } from "@/lib/medical-copilot/api";
import { mapGovernedConsultationTimelineLongitudinalEngineEnvelope } from "./governed-consultation-timeline-longitudinal-engine-mapper";
import type { GovernedConsultationTimelineLongitudinalEngineResult } from "./governed-consultation-timeline-longitudinal-engine";
export type GovernedConsultationTimelineLongitudinalEngineReadAdapter = { get: (sessionId: string) => Promise<GovernedConsultationTimelineLongitudinalEngineResult | null> };
export async function getGovernedConsultationTimelineLongitudinalEngine(sessionId: string): Promise<GovernedConsultationTimelineLongitudinalEngineResult | null> { return mapGovernedConsultationTimelineLongitudinalEngineEnvelope(await getMedicalCopilotGovernedConsultationTimelineLongitudinalEngine(sessionId)); }
export const governedConsultationTimelineLongitudinalEngineReadAdapter: GovernedConsultationTimelineLongitudinalEngineReadAdapter = { get: getGovernedConsultationTimelineLongitudinalEngine };

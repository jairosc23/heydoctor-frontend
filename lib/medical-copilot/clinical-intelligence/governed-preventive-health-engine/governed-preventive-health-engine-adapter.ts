import { getMedicalCopilotGovernedPreventiveHealthEngine } from "../../api";
import { mapGovernedPreventiveHealthEngineEnvelope } from "./governed-preventive-health-engine-mapper";
import type { GovernedPreventiveHealthEngineResult } from "./governed-preventive-health-engine";
export async function getGovernedPreventiveHealthEngine(sessionId: string): Promise<GovernedPreventiveHealthEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPreventiveHealthEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPreventiveHealthEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedPreventiveHealthEngineReadAdapter = { getGovernedPreventiveHealthEngine: typeof getGovernedPreventiveHealthEngine };
export const governedPreventiveHealthEngineReadAdapter: GovernedPreventiveHealthEngineReadAdapter = { getGovernedPreventiveHealthEngine };

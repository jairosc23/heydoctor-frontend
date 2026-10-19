import { getMedicalCopilotGovernedPediatricSafetyEngine } from "../../api";
import { mapGovernedPediatricSafetyEngineEnvelope } from "./governed-pediatric-safety-engine-mapper";
import type { GovernedPediatricSafetyEngineResult } from "./governed-pediatric-safety-engine";
export async function getGovernedPediatricSafetyEngine(sessionId: string): Promise<GovernedPediatricSafetyEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedPediatricSafetyEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPediatricSafetyEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedPediatricSafetyEngineReadAdapter = { getGovernedPediatricSafetyEngine: typeof getGovernedPediatricSafetyEngine };
export const governedPediatricSafetyEngineReadAdapter: GovernedPediatricSafetyEngineReadAdapter = { getGovernedPediatricSafetyEngine };

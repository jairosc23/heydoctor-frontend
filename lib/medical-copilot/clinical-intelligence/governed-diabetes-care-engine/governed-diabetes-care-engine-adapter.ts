import { getMedicalCopilotGovernedDiabetesCareEngine } from "../../api";
import { mapGovernedDiabetesCareEngineEnvelope } from "./governed-diabetes-care-engine-mapper";
import type { GovernedDiabetesCareEngineResult } from "./governed-diabetes-care-engine";
export async function getGovernedDiabetesCareEngine(sessionId: string): Promise<GovernedDiabetesCareEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedDiabetesCareEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedDiabetesCareEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedDiabetesCareEngineReadAdapter = { getGovernedDiabetesCareEngine: typeof getGovernedDiabetesCareEngine };
export const governedDiabetesCareEngineReadAdapter: GovernedDiabetesCareEngineReadAdapter = { getGovernedDiabetesCareEngine };

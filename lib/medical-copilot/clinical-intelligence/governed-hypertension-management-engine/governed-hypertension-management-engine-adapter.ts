import { getMedicalCopilotGovernedHypertensionManagementEngine } from "../../api";
import { mapGovernedHypertensionManagementEngineEnvelope } from "./governed-hypertension-management-engine-mapper";
import type { GovernedHypertensionManagementEngineResult } from "./governed-hypertension-management-engine";
export async function getGovernedHypertensionManagementEngine(sessionId: string): Promise<GovernedHypertensionManagementEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedHypertensionManagementEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedHypertensionManagementEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedHypertensionManagementEngineReadAdapter = { getGovernedHypertensionManagementEngine: typeof getGovernedHypertensionManagementEngine };
export const governedHypertensionManagementEngineReadAdapter: GovernedHypertensionManagementEngineReadAdapter = { getGovernedHypertensionManagementEngine };

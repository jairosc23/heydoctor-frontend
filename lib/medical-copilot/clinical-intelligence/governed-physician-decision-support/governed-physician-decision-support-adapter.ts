import { getMedicalCopilotGovernedPhysicianDecisionSupport } from "../../api";
import { mapGovernedPhysicianDecisionSupportEnvelope } from "./governed-physician-decision-support-mapper";
import type { GovernedPhysicianDecisionSupportResult } from "./governed-physician-decision-support";

export async function getGovernedPhysicianDecisionSupport(sessionId: string): Promise<GovernedPhysicianDecisionSupportResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianDecisionSupport(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedPhysicianDecisionSupportEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedPhysicianDecisionSupportReadAdapter = { getGovernedPhysicianDecisionSupport: typeof getGovernedPhysicianDecisionSupport };
export const governedPhysicianDecisionSupportReadAdapter: GovernedPhysicianDecisionSupportReadAdapter = { getGovernedPhysicianDecisionSupport };

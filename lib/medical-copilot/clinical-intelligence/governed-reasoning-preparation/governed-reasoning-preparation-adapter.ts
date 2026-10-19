import { getMedicalCopilotGovernedReasoningPreparation } from "../../api";
import { mapGovernedReasoningPreparationEnvelope } from "./governed-reasoning-preparation-mapper";
import type { GovernedReasoningPreparationBuilderResult } from "./governed-reasoning-preparation";
export async function getGovernedReasoningPreparation(sessionId: string): Promise<GovernedReasoningPreparationBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedReasoningPreparation(sessionId);
  return mapGovernedReasoningPreparationEnvelope(envelope.data ?? envelope);
}
export type GovernedReasoningPreparationReadAdapter = { getGovernedReasoningPreparation: typeof getGovernedReasoningPreparation };
export const governedReasoningPreparationReadAdapter: GovernedReasoningPreparationReadAdapter = { getGovernedReasoningPreparation };

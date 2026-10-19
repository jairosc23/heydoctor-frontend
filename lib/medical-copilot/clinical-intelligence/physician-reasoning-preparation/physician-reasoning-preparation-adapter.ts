import { getMedicalCopilotPhysicianReasoningPreparation } from "../../api";
import { mapPhysicianReasoningPreparationEnvelope } from "./physician-reasoning-preparation-mapper";
import type { PhysicianReasoningPreparationBuilderResult } from "./physician-reasoning-preparation";

export async function getPhysicianReasoningPreparation(sessionId: string): Promise<PhysicianReasoningPreparationBuilderResult | null> {
  const envelope = await getMedicalCopilotPhysicianReasoningPreparation(sessionId);
  return mapPhysicianReasoningPreparationEnvelope(envelope.data ?? envelope);
}

export type PhysicianReasoningPreparationReadAdapter = { getPhysicianReasoningPreparation: typeof getPhysicianReasoningPreparation };
export const reasoningPreparationReadAdapter: PhysicianReasoningPreparationReadAdapter = { getPhysicianReasoningPreparation };

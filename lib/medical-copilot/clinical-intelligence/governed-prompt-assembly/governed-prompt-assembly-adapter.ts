import { getMedicalCopilotGovernedPromptAssembly } from "../../api";
import { mapGovernedAssembledPromptEnvelope } from "./governed-prompt-assembly-mapper";
import type { GovernedAssembledPromptBuilderResult } from "./governed-prompt-assembly";

export async function getGovernedPromptAssembly(sessionId: string): Promise<GovernedAssembledPromptBuilderResult | null> {
  const envelope = await getMedicalCopilotGovernedPromptAssembly(sessionId);
  return mapGovernedAssembledPromptEnvelope(envelope.data ?? envelope);
}

export type GovernedAssembledPromptReadAdapter = { getGovernedPromptAssembly: typeof getGovernedPromptAssembly };
export const assembledPromptReadAdapter: GovernedAssembledPromptReadAdapter = { getGovernedPromptAssembly };

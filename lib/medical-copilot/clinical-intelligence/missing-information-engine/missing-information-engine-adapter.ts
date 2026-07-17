import { getMedicalCopilotMissingInformationEngine } from "../../api";
import { mapMissingInformationEngineResultEnvelope } from "./missing-information-engine-mapper";
import type { MissingInformationEngineResultBuilderResult } from "./missing-information-engine";

export async function getMissingInformationEngine(sessionId: string): Promise<MissingInformationEngineResultBuilderResult | null> {
  const envelope = await getMedicalCopilotMissingInformationEngine(sessionId);
  return mapMissingInformationEngineResultEnvelope(envelope.data ?? envelope);
}

export type MissingInformationEngineReadAdapter = { getMissingInformationEngine: typeof getMissingInformationEngine };
export const missingInformationReadAdapter: MissingInformationEngineReadAdapter = { getMissingInformationEngine };

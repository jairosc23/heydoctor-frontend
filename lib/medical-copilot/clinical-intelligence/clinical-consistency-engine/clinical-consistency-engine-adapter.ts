import { getMedicalCopilotClinicalConsistencyEngine } from "../../api";
import { mapClinicalConsistencyEngineEnvelope } from "./clinical-consistency-engine-mapper";
import type { ClinicalConsistencyEngineBuilderResult } from "./clinical-consistency-engine";
export async function getClinicalConsistencyEngine(sessionId: string): Promise<ClinicalConsistencyEngineBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalConsistencyEngine(sessionId);
  return mapClinicalConsistencyEngineEnvelope(envelope.data ?? envelope);
}
export type ClinicalConsistencyEngineReadAdapter = { getClinicalConsistencyEngine: typeof getClinicalConsistencyEngine };
export const clinicalConsistencyEngineReadAdapter: ClinicalConsistencyEngineReadAdapter = { getClinicalConsistencyEngine };

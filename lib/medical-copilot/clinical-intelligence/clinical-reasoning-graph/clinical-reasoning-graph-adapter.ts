import { getMedicalCopilotClinicalReasoningGraph } from "../../api";
import { mapClinicalReasoningGraphEnvelope } from "./clinical-reasoning-graph-mapper";
import type { ClinicalReasoningGraphBuilderResult } from "./clinical-reasoning-graph";
export async function getClinicalReasoningGraph(sessionId: string): Promise<ClinicalReasoningGraphBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalReasoningGraph(sessionId);
  return mapClinicalReasoningGraphEnvelope(envelope.data ?? envelope);
}
export type ClinicalReasoningGraphReadAdapter = { getClinicalReasoningGraph: typeof getClinicalReasoningGraph };
export const clinicalReasoningGraphReadAdapter: ClinicalReasoningGraphReadAdapter = { getClinicalReasoningGraph };

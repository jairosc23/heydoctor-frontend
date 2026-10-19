import { getMedicalCopilotClinicalIntelligenceGraph } from "../../api";
import { mapClinicalIntelligenceGraphEnvelope } from "./clinical-intelligence-graph-mapper";
import type { ClinicalIntelligenceGraphBuilderResult } from "./clinical-intelligence-graph";
export async function getClinicalIntelligenceGraph(sessionId: string): Promise<ClinicalIntelligenceGraphBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalIntelligenceGraph(sessionId);
  return mapClinicalIntelligenceGraphEnvelope(envelope.data ?? envelope);
}
export type ClinicalIntelligenceGraphReadAdapter = { getClinicalIntelligenceGraph: typeof getClinicalIntelligenceGraph };
export const clinicalIntelligenceGraphReadAdapter: ClinicalIntelligenceGraphReadAdapter = { getClinicalIntelligenceGraph };

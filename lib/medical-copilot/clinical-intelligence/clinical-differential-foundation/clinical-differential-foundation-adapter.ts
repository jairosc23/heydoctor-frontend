import { getMedicalCopilotClinicalDifferentialFoundation } from "../../api";
import { mapClinicalDifferentialFoundationEnvelope } from "./clinical-differential-foundation-mapper";
import type { ClinicalDifferentialFoundationBuilderResult } from "./clinical-differential-foundation";

export async function getClinicalDifferentialFoundation(sessionId: string): Promise<ClinicalDifferentialFoundationBuilderResult | null> {
  const envelope = await getMedicalCopilotClinicalDifferentialFoundation(sessionId);
  return mapClinicalDifferentialFoundationEnvelope(envelope.data ?? envelope);
}

export type ClinicalDifferentialFoundationReadAdapter = { getClinicalDifferentialFoundation: typeof getClinicalDifferentialFoundation };
export const differentialReadAdapter: ClinicalDifferentialFoundationReadAdapter = { getClinicalDifferentialFoundation };

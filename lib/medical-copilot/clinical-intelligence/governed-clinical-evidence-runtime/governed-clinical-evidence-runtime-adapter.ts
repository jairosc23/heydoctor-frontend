import { getMedicalCopilotGovernedClinicalEvidenceRuntime } from "../../api";
import { mapGovernedClinicalEvidenceRuntimeEnvelope } from "./governed-clinical-evidence-runtime-mapper";
import type { GovernedClinicalEvidenceRuntimeResult } from "./governed-clinical-evidence-runtime";

export async function getGovernedClinicalEvidenceRuntime(sessionId: string): Promise<GovernedClinicalEvidenceRuntimeResult | null> {
  const envelope = await getMedicalCopilotGovernedClinicalEvidenceRuntime(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedClinicalEvidenceRuntimeEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}

export type GovernedClinicalEvidenceRuntimeReadAdapter = { getGovernedClinicalEvidenceRuntime: typeof getGovernedClinicalEvidenceRuntime };
export const governedClinicalEvidenceRuntimeReadAdapter: GovernedClinicalEvidenceRuntimeReadAdapter = { getGovernedClinicalEvidenceRuntime };

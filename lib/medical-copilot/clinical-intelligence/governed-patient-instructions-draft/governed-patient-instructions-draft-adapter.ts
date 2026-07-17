import { getMedicalCopilotGovernedPatientInstructionsDraft } from "../../api";
import { mapGovernedPatientInstructionsDraftEnvelope } from "./governed-patient-instructions-draft-mapper";
import type { GovernedPatientInstructionsDraftResult } from "./governed-patient-instructions-draft";

export async function getGovernedPatientInstructionsDraft(
  sessionId: string,
): Promise<GovernedPatientInstructionsDraftResult | null> {
  const envelope =
    await getMedicalCopilotGovernedPatientInstructionsDraft(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPatientInstructionsDraftEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPatientInstructionsDraftReadAdapter = {
  getGovernedPatientInstructionsDraft: typeof getGovernedPatientInstructionsDraft;
};

export const governedPatientInstructionsDraftReadAdapter: GovernedPatientInstructionsDraftReadAdapter =
  { getGovernedPatientInstructionsDraft };

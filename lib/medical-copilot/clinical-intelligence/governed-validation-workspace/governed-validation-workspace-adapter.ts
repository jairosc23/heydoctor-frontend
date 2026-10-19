import { getMedicalCopilotGovernedValidationWorkspace } from "../../api";
import { mapGovernedValidationWorkspaceEnvelope } from "./governed-validation-workspace-mapper";
import type { GovernedValidationWorkspaceResult } from "./governed-validation-workspace";

export async function getGovernedValidationWorkspace(
  sessionId: string,
): Promise<GovernedValidationWorkspaceResult | null> {
  const envelope = await getMedicalCopilotGovernedValidationWorkspace(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedValidationWorkspaceEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedValidationWorkspaceReadAdapter = {
  getGovernedValidationWorkspace: typeof getGovernedValidationWorkspace;
};

export const governedValidationWorkspaceReadAdapter: GovernedValidationWorkspaceReadAdapter = {
  getGovernedValidationWorkspace,
};

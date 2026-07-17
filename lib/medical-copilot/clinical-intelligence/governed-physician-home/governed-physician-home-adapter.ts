import { getMedicalCopilotGovernedPhysicianHome } from "../../api";
import { mapGovernedPhysicianHomeEnvelope } from "./governed-physician-home-mapper";
import type { GovernedPhysicianHomeResult } from "./governed-physician-home";

export async function getGovernedPhysicianHome(
  sessionId: string,
): Promise<GovernedPhysicianHomeResult | null> {
  const envelope = await getMedicalCopilotGovernedPhysicianHome(sessionId);
  const data =
    envelope.data && typeof envelope.data === "object"
      ? (envelope.data as Record<string, unknown>)
      : {};
  return mapGovernedPhysicianHomeEnvelope({
    ...data,
    reason:
      typeof envelope.reason === "string"
        ? envelope.reason
        : typeof data.reason === "string"
          ? data.reason
          : null,
  });
}

export type GovernedPhysicianHomeReadAdapter = {
  getGovernedPhysicianHome: typeof getGovernedPhysicianHome;
};

export const governedPhysicianHomeReadAdapter: GovernedPhysicianHomeReadAdapter = {
  getGovernedPhysicianHome,
};

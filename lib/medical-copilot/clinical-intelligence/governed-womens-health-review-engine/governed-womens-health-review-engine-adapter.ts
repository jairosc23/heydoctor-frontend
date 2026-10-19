import { getMedicalCopilotGovernedWomensHealthReviewEngine } from "../../api";
import { mapGovernedWomensHealthReviewEngineEnvelope } from "./governed-womens-health-review-engine-mapper";
import type { GovernedWomensHealthReviewEngineResult } from "./governed-womens-health-review-engine";
export async function getGovernedWomensHealthReviewEngine(sessionId: string): Promise<GovernedWomensHealthReviewEngineResult | null> {
  const envelope = await getMedicalCopilotGovernedWomensHealthReviewEngine(sessionId);
  const data = envelope.data && typeof envelope.data === "object" ? (envelope.data as Record<string, unknown>) : {};
  return mapGovernedWomensHealthReviewEngineEnvelope({
    ...data,
    reason: typeof envelope.reason === "string" ? envelope.reason : typeof data.reason === "string" ? data.reason : null,
  });
}
export type GovernedWomensHealthReviewEngineReadAdapter = { getGovernedWomensHealthReviewEngine: typeof getGovernedWomensHealthReviewEngine };
export const governedWomensHealthReviewEngineReadAdapter: GovernedWomensHealthReviewEngineReadAdapter = { getGovernedWomensHealthReviewEngine };

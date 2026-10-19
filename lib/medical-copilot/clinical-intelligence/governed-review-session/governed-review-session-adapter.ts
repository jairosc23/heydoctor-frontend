import { getMedicalCopilotGovernedReviewSession } from "../../api";
import { mapGovernedReviewSessionEnvelope } from "./governed-review-session-mapper";
import type { GovernedReviewSessionBuilderResult } from "./governed-review-session";
import {
  mapHitlDecisionTrail,
  type HitlDecisionTrail,
} from "../../hitl-decision-trail";

export type GovernedReviewSessionReadResult = {
  result: GovernedReviewSessionBuilderResult | null;
  hitlDecisionTrail: HitlDecisionTrail | null;
};

export async function getGovernedReviewSession(
  sessionId: string,
): Promise<GovernedReviewSessionBuilderResult | null> {
  const packed = await getGovernedReviewSessionWithTrail(sessionId);
  return packed.result;
}

export async function getGovernedReviewSessionWithTrail(
  sessionId: string,
): Promise<GovernedReviewSessionReadResult> {
  const envelope = await getMedicalCopilotGovernedReviewSession(sessionId);
  const data =
    envelope && typeof envelope === "object" && "data" in envelope
      ? (envelope as { data?: unknown }).data
      : envelope;
  const root =
    data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const result = mapGovernedReviewSessionEnvelope(data ?? envelope);
  const hitlDecisionTrail = root
    ? mapHitlDecisionTrail(root.hitlDecisionTrail)
    : null;
  return { result, hitlDecisionTrail };
}

export type GovernedReviewSessionReadAdapter = {
  getGovernedReviewSession: typeof getGovernedReviewSession;
  getGovernedReviewSessionWithTrail?: typeof getGovernedReviewSessionWithTrail;
};
export const reviewSessionReadAdapter: GovernedReviewSessionReadAdapter = {
  getGovernedReviewSession,
  getGovernedReviewSessionWithTrail,
};

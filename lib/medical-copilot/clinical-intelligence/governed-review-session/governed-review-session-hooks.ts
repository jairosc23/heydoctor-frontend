"use client";
import { useCallback, useEffect, useState } from "react";
import {
  getGovernedReviewSessionWithTrail,
  reviewSessionReadAdapter,
  type GovernedReviewSessionReadAdapter,
} from "./governed-review-session-adapter";
import type { GovernedReviewSessionBuilderResult } from "./governed-review-session";
import type { HitlDecisionTrail } from "../../hitl-decision-trail";

export type UseGovernedReviewSessionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedReviewSessionReadAdapter;
};
export type UseGovernedReviewSessionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedReviewSessionBuilderResult | null;
  hitlDecisionTrail: HitlDecisionTrail | null;
  refresh: () => void;
};

export function useGovernedReviewSession(
  options: UseGovernedReviewSessionOptions,
): UseGovernedReviewSessionResult {
  const {
    sessionId,
    enabled = true,
    adapter = reviewSessionReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReviewSessionBuilderResult | null>(
    null,
  );
  const [hitlDecisionTrail, setHitlDecisionTrail] =
    useState<HitlDecisionTrail | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setHitlDecisionTrail(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const loader =
      adapter.getGovernedReviewSessionWithTrail ??
      getGovernedReviewSessionWithTrail;
    void loader(sessionId)
      .then((next) => {
        if (!cancelled) {
          setResult(next.result);
          setHitlDecisionTrail(next.hitlDecisionTrail);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResult(null);
          setHitlDecisionTrail(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, hitlDecisionTrail, refresh };
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { reviewSessionReadAdapter, type GovernedReviewSessionReadAdapter } from "./governed-review-session-adapter";
import type { GovernedReviewSessionBuilderResult } from "./governed-review-session";

export type UseGovernedReviewSessionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedReviewSessionReadAdapter;
};
export type UseGovernedReviewSessionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedReviewSessionBuilderResult | null;
  refresh: () => void;
};

export function useGovernedReviewSession(options: UseGovernedReviewSessionOptions): UseGovernedReviewSessionResult {
  const { sessionId, enabled = true, adapter = reviewSessionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReviewSessionBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReviewSession(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}

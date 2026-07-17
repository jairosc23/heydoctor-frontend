"use client";
import { useCallback, useEffect, useState } from "react";
import { reviewSummaryReadAdapter, type PhysicianReviewSummaryReadAdapter } from "./physician-review-summary-adapter";
import type { PhysicianReviewSummaryBuilderResult } from "./physician-review-summary";

export type UsePhysicianReviewSummaryOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianReviewSummaryReadAdapter;
};
export type UsePhysicianReviewSummaryResult = {
  loading: boolean;
  error: string | null;
  result: PhysicianReviewSummaryBuilderResult | null;
  refresh: () => void;
};

export function usePhysicianReviewSummary(options: UsePhysicianReviewSummaryOptions): UsePhysicianReviewSummaryResult {
  const { sessionId, enabled = true, adapter = reviewSummaryReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianReviewSummaryBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianReviewSummary(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { reviewNavigationReadAdapter, type ClinicalReviewNavigationReadAdapter } from "./clinical-review-navigation-adapter";
import type { ClinicalReviewNavigationBuilderResult } from "./clinical-review-navigation";

export type UseClinicalReviewNavigationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReviewNavigationReadAdapter;
};
export type UseClinicalReviewNavigationResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReviewNavigationBuilderResult | null;
  refresh: () => void;
};

export function useClinicalReviewNavigation(options: UseClinicalReviewNavigationOptions): UseClinicalReviewNavigationResult {
  const { sessionId, enabled = true, adapter = reviewNavigationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReviewNavigationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReviewNavigation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}

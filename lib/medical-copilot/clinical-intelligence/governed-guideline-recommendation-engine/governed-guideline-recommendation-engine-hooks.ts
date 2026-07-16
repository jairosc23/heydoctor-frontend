"use client";
import { useCallback, useEffect, useState } from "react";
import { governedGuidelineRecommendationEngineReadAdapter, type GovernedGuidelineRecommendationEngineReadAdapter } from "./governed-guideline-recommendation-engine-adapter";
import type { GovernedGuidelineRecommendationEngineResult } from "./governed-guideline-recommendation-engine";
export type UseGovernedGuidelineRecommendationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGuidelineRecommendationEngineReadAdapter };
export type UseGovernedGuidelineRecommendationEngineResult = { loading: boolean; error: string | null; result: GovernedGuidelineRecommendationEngineResult | null; refresh: () => void };
export function useGovernedGuidelineRecommendationEngine(options: UseGovernedGuidelineRecommendationEngineOptions): UseGovernedGuidelineRecommendationEngineResult {
  const { sessionId, enabled = true, adapter = governedGuidelineRecommendationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGuidelineRecommendationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
